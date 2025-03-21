// src/app/admin/items/viewModel.ts
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, onSnapshot } from "firebase/firestore";

interface Item {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  rented: number;
  inStock: number;
  description?: string;
  gallery?: string[];
}

interface NewItem {
  name: string;
  category: string;
  subcategory: string;
  image: File | null;
  rented?: number; // Optional for form input
  inStock?: number; // Optional for form input
}

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const useItemsViewModel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<NewItem>({ name: "", category: "", subcategory: "", image: null, rented: 0, inStock: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", subcategory: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribeItems = onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          category: doc.data().category,
          subcategory: doc.data().subcategory,
          imageUrl: doc.data().imageUrl,
          rented: doc.data().rented || 0,
          inStock: doc.data().inStock || 0,
          description: doc.data().description || "Ingen beskrivelse tilgjengelig.",
          gallery: doc.data().gallery || [doc.data().imageUrl],
        })) as Item[];
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (error) => {
        console.error("Fetch items error:", error);
        setError("Failed to fetch items");
        setIsLoading(false);
      }
    );

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesCollection = await getDocs(collection(db, "categories"));
        const fetched = categoriesCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];

        if (fetched.length === 0) {
          const initialCategories = [
            { name: "Bikes", subcategories: ["Mountain", "City"] },
            { name: "Camping", subcategories: ["Tents", "Sleeping Bags"] },
          ];
          for (const cat of initialCategories) {
            await setDoc(doc(db, "categories", cat.name), cat);
          }
          setCategories(initialCategories.map((cat) => ({ id: cat.name, ...cat })));
        } else {
          setCategories(fetched);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
        setError("Failed to fetch categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    return () => unsubscribeItems(); // Cleanup listener on unmount
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.subcategory || !newItem.image) {
      setError("All fields are required");
      return;
    }

    if (newItem.image.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    if (!newItem.image.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in first");

      const token = await user.getIdToken(true);
      const formData = new FormData();
      formData.append("file", newItem.image);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Raw response:", text);
        throw new Error(`Upload failed: ${response.status} - ${text}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${contentType || "null"} - ${text}`);
      }

      const result = await response.json();
      const imageUrl = result.url;

      const itemData = {
        name: newItem.name,
        category: newItem.category,
        subcategory: newItem.subcategory,
        imageUrl: imageUrl,
        rented: newItem.rented ?? 0, // Use form value or default
        inStock: newItem.inStock ?? 10, // Use form value or default
        description: "En flott vare til utleie.",
        gallery: [imageUrl],
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "items"), itemData);

      // No need to manually update state here; onSnapshot will handle it
      setNewItem({ name: "", category: "", subcategory: "", image: null, rented: 0, inStock: 10 });
      setIsFormOpen(false);
      console.log("Item added successfully:", { id: docRef.id, ...itemData });
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "items", id));
      // No need to update state manually; onSnapshot will reflect deletion
    } catch (error) {
      console.error("Delete item error:", error);
      setError("Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.subcategory) {
      setError("Category name and subcategory are required");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const existing = categories.find((cat) => cat.name === newCategory.name);
      if (existing) {
        const updatedSubcategories = [...new Set([...existing.subcategories, newCategory.subcategory])];
        await setDoc(doc(db, "categories", newCategory.name), { subcategories: updatedSubcategories }, { merge: true });
        setCategories(categories.map((cat) =>
          cat.name === newCategory.name ? { ...cat, subcategories: updatedSubcategories } : cat
        ));
      } else {
        const newCat = { name: newCategory.name, subcategories: [newCategory.subcategory] };
        await setDoc(doc(db, "categories", newCategory.name), newCat);
        setCategories([...categories, { id: newCategory.name, ...newCat }]);
      }
      setNewCategory({ name: "", subcategory: "" });
      setIsCategoryFormOpen(false);
    } catch (error) {
      console.error("Add category error:", error);
      setError("Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = ["All", ...categories.map((cat) => cat.name)];
  const filteredItems = items.filter((item) =>
    (selectedCategory === "All" || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    items,
    newItem,
    setNewItem,
    searchTerm,
    setSearchTerm,
    isFormOpen,
    setIsFormOpen,
    selectedCategory,
    setSelectedCategory,
    isCategoryPickerOpen,
    setIsCategoryPickerOpen,
    categories,
    isCategoryFormOpen,
    setIsCategoryFormOpen,
    newCategory,
    setNewCategory,
    handleAddItem,
    handleDeleteItem,
    handleAddCategory,
    filterCategories,
    filteredItems,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};