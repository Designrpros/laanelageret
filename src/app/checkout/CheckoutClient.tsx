"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { db, auth, googleProvider } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc, addDoc } from "firebase/firestore"; // Added addDoc
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  rented: number;
  inStock: number;
}

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  quantity: number;
}

interface UserData {
  email: string;
  rentals: { itemId: string; name: string; quantity: number; date: string; category: string }[];
}

// Styled components (unchanged, omitted for brevity)

const CheckoutClient = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/utlaan/1";

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      console.log("[Checkout] Loaded cart from localStorage:", parsedCart);
    }

    if (auth.currentUser) {
      const userCartRef = doc(db, "users", auth.currentUser.uid, "cart", "current");
      onSnapshot(userCartRef, (doc) => {
        if (doc.exists()) {
          const firestoreCart = doc.data().items || [];
          setCart(firestoreCart);
          localStorage.setItem("cart", JSON.stringify(firestoreCart));
          console.log("[Checkout] Loaded cart from Firestore:", firestoreCart);
        }
      });
    }

    const unsubscribe = onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          imageUrl: doc.data().imageUrl || "/placeholder-image.jpg",
          category: doc.data().category || "Ukjent",
          rented: doc.data().rented || 0,
          inStock: doc.data().inStock || 0,
        })) as Item[];
        setItems(fetchedItems);
        console.log("[Checkout] Fetched items:", fetchedItems);
        setLoading(false);
      },
      (error) => {
        console.error("[Checkout] Error fetching items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || newQuantity < 1 || newQuantity > item.inStock - item.rented) return;

    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const logRentalStart = async (userId: string, email: string, itemId: string, itemName: string, quantity: number) => {
    try {
      await addDoc(collection(db, "receipts"), {
        userId,
        email,
        itemId,
        itemName,
        quantity,
        date: new Date().toISOString(),
        type: "rental",
      });
      console.log(`[Checkout] Rental logged: ${email} - ${itemName} (Qty: ${quantity})`);
    } catch (error) {
      console.error("[Checkout] Error logging rental:", error);
    }
  };

  const handleConfirmRental = async () => {
    const user = auth.currentUser;
    if (!user || cart.length === 0) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const existingRentals = userDoc.exists() ? (userDoc.data() as UserData).rentals || [] : [];
      console.log("[Checkout] Existing rentals:", existingRentals);

      for (const cartItem of cart) {
        const itemRef = doc(db, "items", cartItem.id);
        const item = items.find((i) => i.id === cartItem.id);
        if (item && cartItem.quantity <= item.inStock - item.rented) {
          await updateDoc(itemRef, {
            rented: item.rented + cartItem.quantity,
            inStock: item.inStock - cartItem.quantity,
          });
          console.log(`[Checkout] Updated item ${cartItem.id}: rented=${item.rented + cartItem.quantity}, inStock=${item.inStock - cartItem.quantity}`);
          // Log rental start
          await logRentalStart(user.uid, user.email || "Unknown", cartItem.id, cartItem.name, cartItem.quantity);
        } else {
          throw new Error(`Ikke nok på lager for ${cartItem.name}`);
        }
      }

      const newRentals = cart.map((cartItem) => ({
        itemId: cartItem.id,
        name: cartItem.name,
        quantity: cartItem.quantity,
        date: new Date().toISOString(),
        category: items.find((i) => i.id === cartItem.id)?.category || "Ukjent",
      }));
      console.log("[Checkout] New rentals to save:", newRentals);

      await setDoc(
        userRef,
        {
          email: user.email,
          rentals: [...existingRentals, ...newRentals],
        },
        { merge: true }
      );
      console.log("[Checkout] Rentals saved to Firestore for user:", user.uid);

      const userCartRef = doc(db, "users", user.uid, "cart", "current");
      await setDoc(userCartRef, { items: [] }, { merge: true });
      localStorage.setItem("cart", JSON.stringify([]));
      setCart([]);

      alert("Utlån bekreftet!");
      router.push("/lever");
    } catch (error) {
      console.error("[Checkout] Utlånsfeil:", error);
      alert("Kunne ikke bekrefte utlån. Prøv igjen.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoginLoading(true);
      await signInWithPopup(auth, googleProvider);
      console.log("[Checkout] Google sign-in successful");
    } catch (error: any) {
      console.error("[Checkout] Google sign-in error:", error);
      alert(`Login error: ${error.message}`);
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) return <CheckoutContainer><CheckoutTitle>Laster...</CheckoutTitle></CheckoutContainer>;

  return (
    <CheckoutContainer>
      <ContentWrapper>
        <CheckoutTitle initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          Kasse
        </CheckoutTitle>
        {cart.length > 0 ? (
          <>
            <CartList>
              {cart.map((item) => {
                const stockItem = items.find((i) => i.id === item.id);
                const maxQuantity = stockItem ? stockItem.inStock - stockItem.rented : 0;
                return (
                  <CartItem key={item.id}>
                    <CartItemImage src={item.imageUrl} alt={item.name} />
                    <CartItemDetails>
                      <CartItemName>{item.name}</CartItemName>
                      <CartItemCategory>Kategori: {stockItem?.category || "Ukjent"}</CartItemCategory>
                      <QuantityControls>
                        <QuantityButton
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </QuantityButton>
                        <QuantityInput
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          min="1"
                          max={maxQuantity.toString()}
                        />
                        <QuantityButton
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= maxQuantity}
                        >
                          +
                        </QuantityButton>
                      </QuantityControls>
                    </CartItemDetails>
                    <RemoveButton onClick={() => removeFromCart(item.id)}>Fjern</RemoveButton>
                  </CartItem>
                );
              })}
            </CartList>
            {auth.currentUser ? (
              <ConfirmButton onClick={handleConfirmRental}>Bekreft utlån</ConfirmButton>
            ) : (
              <LoginButton onClick={handleGoogleSignIn} disabled={loginLoading}>
                {loginLoading ? "Logger inn..." : "Logg inn for å bekrefte"}
              </LoginButton>
            )}
          </>
        ) : (
          <p>Handlekurven din er tom.</p>
        )}
      </ContentWrapper>
    </CheckoutContainer>
  );
};

export default CheckoutClient;


const CheckoutContainer = styled.div`
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2rem);
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: clamp(1rem, 3vw, 2rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const CheckoutTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  text-align: center;
`;

const CartList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const CartItem = styled.div`
  background: #fff;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 1rem);

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CartItemImage = styled.img`
  width: clamp(60px, 10vw, 80px);
  height: clamp(60px, 10vw, 80px);
  object-fit: cover;
  border-radius: 4px;
`;

const CartItemDetails = styled.div`
  flex-grow: 1;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const CartItemName = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const CartItemCategory = styled.p`
  font-size: clamp(0.8rem, 2vw, 1rem);
  color: #666;
  margin-bottom: 0.5rem;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 1vw, 0.5rem);

  @media (max-width: 480px) {
    margin-top: 0.5rem;
  }
`;

const QuantityButton = styled.button`
  padding: clamp(4px, 1vw, 8px) clamp(8px, 2vw, 12px);
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: clamp(0.9rem, 2vw, 1rem);

  &:hover {
    background: #333;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const QuantityInput = styled.input`
  width: clamp(40px, 8vw, 60px);
  padding: clamp(4px, 1vw, 6px);
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: clamp(0.9rem, 2vw, 1rem);
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: #fff;
  border: none;
  padding: clamp(4px, 1vw, 8px) clamp(8px, 2vw, 12px);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: clamp(0.9rem, 2vw, 1rem);

  &:hover {
    background: #cc3333;
  }

  @media (max-width: 480px) {
    margin-top: 0.5rem;
    width: 100%;
  }
`;

const ConfirmButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: clamp(10px, 2vw, 14px);
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: clamp(1rem, 2vw, 1.25rem);
  cursor: pointer;
  margin: clamp(1.5rem, 3vw, 2rem) auto 0;
  display: block;
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: clamp(10px, 2vw, 14px);
  background: #4285f4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: clamp(1rem, 2vw, 1.25rem);
  cursor: pointer;
  margin: clamp(1rem, 2vw, 1.5rem) auto 0;
  display: block;
  transition: background 0.3s ease;

  &:hover {
    background: #357abd;
  }
`;