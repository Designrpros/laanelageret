// src/app/checkout/CheckoutClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { db, auth } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  rented: number;
  inStock: number;
}

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
}

interface UserData {
  email: string;
  rentals: { itemId: string; name: string; quantity: number; date: string }[];
}

const CheckoutContainer = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  background: #f5f7fa;
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CheckoutTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const CartList = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CartItem = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CartItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const CartItemDetails = styled.div`
  flex-grow: 1;
`;

const CartItemName = styled.p`
  font-size: 1.25rem;
  color: #1a1a1a;
  font-weight: 500;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityButton = styled.button`
  padding: 5px 10px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const QuantityInput = styled.input`
  width: 60px;
  padding: 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #cc3333;
  }
`;

const ConfirmButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: 12px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 2rem;
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }
`;

const CheckoutClient = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/utlaan/1";

  useEffect(() => {
    if (!auth.currentUser) {
      router.push(`/login?returnTo=/checkout`);
      return;
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        imageUrl: doc.data().imageUrl,
        rented: doc.data().rented || 0,
        inStock: doc.data().inStock || 0,
      })) as Item[];
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  const handleConfirmRental = async () => {
    const user = auth.currentUser;
    if (!user || cart.length === 0) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const existingRentals = userDoc.exists() ? (userDoc.data() as UserData).rentals || [] : [];

      for (const cartItem of cart) {
        const itemRef = doc(db, "items", cartItem.id);
        const item = items.find((i) => i.id === cartItem.id);
        if (item && cartItem.quantity <= item.inStock - item.rented) {
          await updateDoc(itemRef, {
            rented: item.rented + cartItem.quantity,
            inStock: item.inStock - cartItem.quantity,
          });
        } else {
          throw new Error(`Insufficient stock for ${cartItem.name}`);
        }
      }

      const newRentals = cart.map((cartItem) => ({
        itemId: cartItem.id,
        name: cartItem.name,
        quantity: cartItem.quantity,
        date: new Date().toISOString(),
      }));
      await setDoc(
        userRef,
        {
          email: user.email,
          rentals: [...existingRentals, ...newRentals],
        },
        { merge: true }
      );

      alert("Rental confirmed!");
      localStorage.removeItem("cart");
      setCart([]);
      router.push(returnTo);
    } catch (error) {
      console.error("Rental error:", error);
      alert("Failed to confirm rental. Try again.");
    }
  };

  if (loading) return <CheckoutContainer><CheckoutTitle>Loading...</CheckoutTitle></CheckoutContainer>;

  return (
    <CheckoutContainer>
      <CheckoutTitle
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Checkout
      </CheckoutTitle>
      {cart.length > 0 ? (
        <CartList>
          {cart.map((item) => {
            const stockItem = items.find((i) => i.id === item.id);
            const maxQuantity = stockItem ? stockItem.inStock - stockItem.rented : 0;
            return (
              <CartItem key={item.id}>
                <CartItemImage src={item.imageUrl} alt={item.name} />
                <CartItemDetails>
                  <CartItemName>{item.name}</CartItemName>
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
                <RemoveButton onClick={() => removeFromCart(item.id)}>Remove</RemoveButton>
              </CartItem>
            );
          })}
          <ConfirmButton onClick={handleConfirmRental}>Confirm Rental</ConfirmButton>
        </CartList>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </CheckoutContainer>
  );
};

export default CheckoutClient;