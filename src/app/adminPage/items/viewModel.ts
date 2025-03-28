"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase";
import { collection, addDoc, deleteDoc, doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
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
  createdAt?: string;
  createdBy?: string;
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
  createdAt?: string;
  createdBy?: string;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState({ name: "", subcategory: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
          createdAt: doc.data().createdAt || "",
          createdBy: doc.data().createdBy || "",
        }) as Item).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setItems(fetchedItems);
      },
      (error) => {
        setError("Failed to fetch items: " + error.message);
        setIsLoading(false);
      }
    );

    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const fetchedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: capitalizeFirstLetter(doc.data().name), // Display with first letter capitalized
          subcategories: (doc.data().subcategories || []).map((sub: string) => capitalizeFirstLetter(sub)),
          createdAt: doc.data().createdAt || "",
          createdBy: doc.data().createdBy || "",
        }) as Category);
        console.log("Fetched categories:", fetchedCategories); // Debug log
        setCategories(fetchedCategories);
        setIsLoading(false);
      },
      (error) => {
        setError("Failed to fetch categories: " + error.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeItems();
      unsubscribeCategories();
    };
  }, []);

  const handleAddItem = async () => {
    const { name, category, subcategory, image, location } = newItem;
    if (!name.trim() || !category.trim() || !subcategory.trim() || !image || !location.trim()) {
      setError("All item fields are required");
      return;
    }
    if (name.length > 100 || category.length > 50 || subcategory.length > 50) {
      setError("Item name (max 100) and category/subcategory (max 50) have length limits");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to add items");

      const imageRef = ref(storage, `items/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      const itemData = {
        name: name.trim(),
        category: capitalizeFirstLetter(category.trim()), // Store with first letter capitalized
        subcategory: capitalizeFirstLetter(subcategory.trim()),
        imageUrl,
        rented: newItem.rented ?? 0,
        inStock: newItem.inStock ?? 10,
        location: location.trim(),
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      await addDoc(collection(db, "items"), itemData);
      setNewItem({ name: "", category: "", subcategory: "", image: null, rented: 0, inStock: 10, location: "" });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!id) {
      setError("Invalid item ID");
      return;
    }
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to delete items");
      await deleteDoc(doc(db, "items", id));
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    console.log("handleAddCategory called with:", newCategory);
    
    const categoryNameRaw = newCategory.name.trim();
    const subcategoryNameRaw = newCategory.subcategory.trim();
    const categoryNameLower = categoryNameRaw.toLowerCase(); // For document ID
    const categoryName = capitalizeFirstLetter(categoryNameRaw); // For display
    const subcategoryName = capitalizeFirstLetter(subcategoryNameRaw);

    if (!categoryNameRaw || !subcategoryNameRaw) {
      setError("Category name and subcategory are required");
      return;
    }
    if (categoryName.length > 50 || subcategoryName.length > 50) {
      setError("Category and subcategory names must be 50 characters or less");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to add categories");
      }

      const categoryRef = doc(db, "categories", categoryNameLower); // Use lowercase ID
      const categorySnap = await getDoc(categoryRef);

      if (categorySnap.exists()) {
        const existingData = categorySnap.data();
        const subcategories = Array.isArray(existingData.subcategories)
          ? existingData.subcategories.map((sub: string) => sub.toLowerCase())
          : [];
        if (!subcategories.includes(subcategoryName.toLowerCase())) {
          const updatedSubcategories = [
            ...existingData.subcategories,
            subcategoryName,
          ];
          await updateDoc(categoryRef, { subcategories: updatedSubcategories });
          console.log("Added subcategory to existing category:", categoryName);
        } else {
          console.log("Subcategory already exists in", categoryName, "- no changes made");
          setError("This tag already exists for the category");
        }
      } else {
        const newCat = {
          name: categoryName,
          subcategories: [subcategoryName],
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        };
        await setDoc(categoryRef, newCat);
        console.log("Created new category:", categoryName);
      }

      setNewCategory({ name: "", subcategory: "" });
      setIsCategoryFormOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(`Failed to add category: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = ["All", ...categories.map((cat) => cat.name)];
  const filteredItems = items.filter(
    (item) =>
      (selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase()) &&
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