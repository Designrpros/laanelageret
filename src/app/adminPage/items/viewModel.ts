// src/app/admin/items/viewModel.ts
"use client";

import { useState, useEffect } from "react";
import { db, auth, storage } from "../../../firebase"; // Ensure this points to the correct firebase.ts
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  location: string;
}

interface NewItem {
  name: string;
  category: string;
  subcategory: string;
  image: File | null;
  rented?: number;
  inStock?: number;
  location: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const useItemsViewModel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<NewItem>({
    name: "",
    category: "",
    subcategory: "",
    image: null,
    rented: 0,
    inStock: 10,
    location: "",
  });
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
          location: doc.data().location || "Unknown",
        })) as Item[];
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error("Fetch items error:", error.message, error);
        setError("Failed to fetch items: " + error.message);
        setIsLoading(false);
      }
    );

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesCollection = await getDocs(collection(db, "categories"));
        const fetched = categoriesCollection.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          subcategories: doc.data().subcategories || [],
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
      } catch (error: unknown) {
        const err = error as Error; // Type assertion
        console.error("Fetch categories error:", err.message, err);
        setError("Failed to fetch categories: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    return () => unsubscribeItems();
  }, []);

  const handleAddItem = async () => {
    if (
      !newItem.name ||
      !newItem.category ||
      !newItem.subcategory ||
      !newItem.image ||
      !newItem.location
    ) {
      setError("All fields (Name, Category, Subcategory, Image, Location) are required");
      return;
    }

    if (newItem.image.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
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

      const imageRef = ref(storage, `items/${newItem.image.name}`);
      await uploadBytes(imageRef, newItem.image);
      const imageUrl = await getDownloadURL(imageRef);

      const itemData = {
        name: newItem.name,
        category: newItem.category,
        subcategory: newItem.subcategory,
        imageUrl,
        rented: newItem.rented ?? 0,
        inStock: newItem.inStock ?? 10,
        description: "En flott vare til utleie.",
        gallery: [imageUrl],
        location: newItem.location,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "items"), itemData);

      setItems([...items, { id: docRef.id, ...itemData }]);
      setNewItem({
        name: "",
        category: "",
        subcategory: "",
        image: null,
        rented: 0,
        inStock: 10,
        location: "",
      });
      setIsFormOpen(false);
      console.log("Item added successfully:", { id: docRef.id, ...itemData });
    } catch (error: unknown) {
      const err = error as Error; // Type assertion
      console.error("Add item error:", err.message, err);
      setError(err.message || "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "items", id));
    } catch (error: unknown) {
      const err = error as Error; // Type assertion
      console.error("Delete item error:", err.message, err);
      setError("Failed to delete item: " + err.message);
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
        const updatedSubcategories = [
          ...new Set([...existing.subcategories, newCategory.subcategory]),
        ];
        console.log("Updating existing category:", existing.id, updatedSubcategories);
        await setDoc(
          doc(db, "categories", existing.id),
          { subcategories: updatedSubcategories },
          { merge: true }
        );
        setCategories(
          categories.map((cat) =>
            cat.id === existing.id ? { ...cat, subcategories: updatedSubcategories } : cat
          )
        );
      } else {
        const newCat = {
          name: newCategory.name,
          subcategories: [newCategory.subcategory],
        };
        console.log("Adding new category:", newCat);
        const docRef = await addDoc(collection(db, "categories"), newCat);
        setCategories([...categories, { id: docRef.id, ...newCat }]);
      }
      setNewCategory({ name: "", subcategory: "" });
      setIsCategoryFormOpen(false);
      console.log("Category added successfully:", newCategory);
    } catch (error: unknown) {
      const err = error as Error; // Type assertion
      console.error("Add category error:", err.message, err.stack);
      setError(`Failed to add category: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = ["All", ...categories.map((cat) => cat.name)];
  const filteredItems = items.filter(
    (item) =>
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