"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../firebase";
import { collection, addDoc, deleteDoc, doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Item { id: string; name: string; category: string; subcategory?: string; imageUrl: string; rented: number; inStock: number; description?: string; gallery?: string[]; location: string; createdAt?: string; }
interface NewItem { name: string; category: string; subcategory: string; image: File | null; rented?: number; inStock?: number; location: string; }
interface Category { id: string; name: string; subcategories: string[]; }

export const useItemsViewModel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<NewItem>({
    name: "", category: "", subcategory: "", image: null, rented: 0, inStock: 10, location: "",
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

    const unsubscribeItems = onSnapshot(collection(db, "items"), (snapshot) => {
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
        createdAt: doc.data().createdAt || "",
      }) as Item).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setItems(fetchedItems);
    });

    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        subcategories: doc.data().subcategories || [],
      })) as Category[];
      if (fetchedCategories.length === 0) {
        const initialCategories = [
          { name: "Bikes", subcategories: ["Mountain", "City"] },
          { name: "Camping", subcategories: ["Tents", "Sleeping Bags"] },
        ];
        initialCategories.forEach((cat) => setDoc(doc(db, "categories", cat.name), cat));
        setCategories(initialCategories.map((cat) => ({ id: cat.name, ...cat })));
      } else {
        setCategories(fetchedCategories);
      }
      setIsLoading(false);
    }, (error) => {
      setError("Failed to fetch categories: " + error.message);
      setIsLoading(false);
    });

    return () => {
      unsubscribeItems();
      unsubscribeCategories();
    };
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.subcategory || !newItem.image || !newItem.location) {
      setError("All fields are required");
      return;
    }
    setIsLoading(true);
    try {
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
        location: newItem.location,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "items"), itemData);
      setNewItem({ name: "", category: "", subcategory: "", image: null, rented: 0, inStock: 10, location: "" });
      setIsFormOpen(false);
    } catch (error) {
      setError("Failed to add item: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "items", id));
    } catch (error) {
      setError("Failed to delete item: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    console.log("handleAddCategory called with:", newCategory);
    if (!newCategory.name || !newCategory.subcategory) {
      setError("Category name and subcategory are required");
      return;
    }

    setIsLoading(true);
    try {
      const categoryRef = doc(db, "categories", newCategory.name);
      const categorySnap = await getDoc(categoryRef);

      if (categorySnap.exists()) {
        const existingData = categorySnap.data();
        const subcategories = existingData.subcategories || [];
        if (!subcategories.includes(newCategory.subcategory)) {
          const updatedSubcategories = [...subcategories, newCategory.subcategory];
          await updateDoc(categoryRef, { subcategories: updatedSubcategories });
          console.log("Updated category:", newCategory.name);
        } else {
          console.log("Subcategory already exists in", newCategory.name);
        }
      } else {
        const newCat = {
          name: newCategory.name,
          subcategories: [newCategory.subcategory],
        };
        await setDoc(categoryRef, newCat);
        console.log("Created new category:", newCategory.name);
      }

      setNewCategory({ name: "", subcategory: "" });
      setIsCategoryFormOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category: " + (error as Error).message);
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