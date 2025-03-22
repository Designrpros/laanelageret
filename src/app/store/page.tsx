"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { FaShoppingCart } from "react-icons/fa";

interface Item {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  location: string;
  rented: number;
  inStock: number;
}

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
}

// Styled Components
const StoreContainer = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  background: #f5f7fa;
  font-family: "Helvetica", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StoreTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
`;

const CartIcon = styled(FaShoppingCart)`
  font-size: 1.5rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #007bff;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  max-width: 1200px;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 10px 20px;
  font-size: clamp(14px, 2vw, 16px);
  background: ${({ isActive }) => (isActive ? "#007bff" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#1a1a1a")};
  border: 2px solid #007bff;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #007bff;
    color: #fff;
    transform: translateY(-2px);
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const StoreItemCard = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 2px solid #007bff;
`;

const ItemContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const ItemName = styled.h3`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const ItemCategory = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const BorrowButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #0056b3;
  }
`;

const CartModal = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  z-index: 1000;
`;

const CartTitle = styled.h2`
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
`;

const CartItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const CartItemDetails = styled.div`
  flex-grow: 1;
`;

const CartItemName = styled.p`
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 500;
`;

const CartItemQuantity = styled.p`
  font-size: 0.9rem;
  color: #666;
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

const CheckoutButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background 0.3s ease;

  &:hover {
    background: #0056b3;
  }
`;

const Store: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        category: doc.data().category,
        subcategory: doc.data().subcategory,
        imageUrl: doc.data().imageUrl,
        location: doc.data().location || "Unknown",
        rented: doc.data().rented || 0,
        inStock: doc.data().inStock || 0,
      })) as Item[];
      setItems(fetchedItems);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const locations = ["All", ...new Set(items.map((item) => item.location))];

  const filteredItems = items.filter((item) =>
    (selectedCategory === "All" || item.category === selectedCategory) &&
    (selectedLocation === "All" || item.location === selectedLocation)
  );

  const addToCart = (item: Item) => {
    if (item.inStock <= 0) {
      alert(`${item.name} is out of stock!`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, imageUrl: item.imageUrl, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => {
    alert("Checkout functionality to be implemented!");
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <StoreContainer>
      <StoreTitle
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Our Store
      </StoreTitle>

      <Toolbar>
        <CartIcon onClick={() => setIsCartOpen(!isCartOpen)} />
        {cart.length > 0 && <span>({cart.length})</span>}
      </Toolbar>

      <FilterBar>
        {locations.map((location) => (
          <FilterButton
            key={location}
            isActive={selectedLocation === location}
            onClick={() => setSelectedLocation(location)}
          >
            {location}
          </FilterButton>
        ))}
      </FilterBar>

      <FilterBar>
        {categories.map((category) => (
          <FilterButton
            key={category}
            isActive={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </FilterButton>
        ))}
      </FilterBar>

      {isLoading ? (
        <p>Loading items...</p>
      ) : (
        <ItemGrid>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <StoreItemCard
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ItemImage src={item.imageUrl} alt={item.name} />
                <ItemContent>
                  <ItemName>{item.name}</ItemName>
                  <ItemCategory>
                    {item.category}{item.subcategory ? ` - ${item.subcategory}` : ""} ({item.location})
                  </ItemCategory>
                  <BorrowButton onClick={() => addToCart(item)}>
                    Add to Cart ({item.inStock} available)
                  </BorrowButton>
                </ItemContent>
              </StoreItemCard>
            ))
          ) : (
            <p>No items available for this location/category.</p>
          )}
        </ItemGrid>
      )}

      {isCartOpen && (
        <CartModal
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <CartTitle>Your Cart</CartTitle>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <CartItem key={item.id}>
                  <CartItemImage src={item.imageUrl} alt={item.name} />
                  <CartItemDetails>
                    <CartItemName>{item.name}</CartItemName>
                    <CartItemQuantity>Quantity: {item.quantity}</CartItemQuantity>
                  </CartItemDetails>
                  <RemoveButton onClick={() => removeFromCart(item.id)}>Remove</RemoveButton>
                </CartItem>
              ))}
              <CheckoutButton onClick={handleCheckout}>Checkout</CheckoutButton>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </CartModal>
      )}
    </StoreContainer>
  );
};

export default Store;