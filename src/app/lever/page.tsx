"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, setDoc, collection, onSnapshot, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ReportForm } from "./ReportForm";

interface Rental {
  itemId: string;
  name: string;
  quantity: number;
  date: string;
  location?: string; // Optional, added for consistency
}

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
  rented: number;
  inStock: number;
}

interface UserData {
  email: string;
  rentals: Rental[];
}

const Lever = () => {
  const [userRentals, setUserRentals] = useState<Rental[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<string>("");
  const [reportDetails, setReportDetails] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Stabekk"); // New state for location
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login?returnTo=/lever");
      return;
    }

    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);

    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        console.log("User data from Firestore:", data);
        const rentals = data.rentals || [];
        console.log("Rentals array:", rentals);
        setUserRentals(rentals);
      } else {
        console.log("User document does not exist");
        setUserRentals([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user rentals:", error);
      setLoading(false);
    });

    const unsubscribeItems = onSnapshot(collection(db, "items"), (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        imageUrl: doc.data().imageUrl || "/placeholder-image.jpg",
        category: doc.data().category || "Unknown",
        subcategory: doc.data().subcategory,
        rented: doc.data().rented || 0,
        inStock: doc.data().inStock || 0,
      })) as Item[];
      console.log("Fetched items:", fetchedItems);
      setItems(fetchedItems);
    }, (error) => {
      console.error("Error fetching items:", error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeItems();
    };
  }, [router]);

  const logRentalReturn = async (userId: string, email: string, itemId: string, itemName: string, quantity: number) => {
    try {
      await addDoc(collection(db, "receipts"), {
        userId,
        email,
        itemId,
        itemName,
        quantity,
        date: new Date().toISOString(),
        type: "return",
      });
      console.log(`[Lever] Return logged: ${email} - ${itemName} (Qty: ${quantity})`);
    } catch (error) {
      console.error("[Lever] Error logging return:", error);
    }
  };

  const handleReturn = async (rental: Rental) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const itemRef = doc(db, "items", rental.itemId);
      const item = items.find((i) => i.id === rental.itemId);
      if (item) {
        const newRented = Math.max(0, item.rented - rental.quantity);
        const newInStock = item.inStock + rental.quantity;
        console.log(`Returning ${rental.name}: rented=${newRented}, inStock=${newInStock}`);
        await updateDoc(itemRef, {
          rented: newRented,
          inStock: newInStock,
        });
        await logRentalReturn(user.uid, user.email || "Unknown", rental.itemId, rental.name, rental.quantity);
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const currentRentals = (userDoc.data() as UserData).rentals || [];
      const updatedRentals = currentRentals.filter(
        (r) => r.itemId !== rental.itemId || r.date !== rental.date
      );
      console.log("Updated rentals after return:", updatedRentals);

      await setDoc(userRef, { rentals: updatedRentals }, { merge: true });

      setUserRentals(updatedRentals);
      alert(`${rental.name} returned successfully!`);
    } catch (error) {
      console.error("Return error:", error);
      alert("Failed to return item. Try again.");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !selectedRental || !reportDetails) return;

    try {
      const selected = userRentals.find((r) => `${r.itemId}-${r.date}` === selectedRental);
      if (!selected) return;

      const reportRef = doc(collection(db, "reports"));
      await setDoc(reportRef, {
        userId: user.uid,
        email: user.email,
        itemId: selected.itemId,
        itemName: selected.name,
        quantity: selected.quantity,
        dateRented: selected.date,
        reportDetails,
        reportedAt: new Date().toISOString(),
        status: "pending",
        location: selectedLocation, // Include selected location
      });

      alert("Rapport sendt inn!");
      setSelectedRental("");
      setReportDetails("");
      setSelectedLocation("Stabekk"); // Reset to default
      setIsFormOpen(false);
    } catch (error) {
      console.error("Report submission error:", error);
      alert("Kunne ikke sende inn rapport. Prøv igjen.");
    }
  };

  if (loading) return <LeverContainer><LeverTitle>Laster...</LeverTitle></LeverContainer>;

  return (
    <LeverContainer>
      <ContentWrapper>
        <LeverTitle
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Lever
        </LeverTitle>

        {userRentals.length > 0 ? (
          <RentalList>
            {userRentals.map((rental, idx) => {
              const item = items.find((i) => i.id === rental.itemId);
              return (
                <RentalItem key={idx}>
                  {item && <RentalImage src={item.imageUrl} alt={item.name} />}
                  <RentalDetails>
                    <RentalName>{rental.name}</RentalName>
                    {item && (
                      <RentalTags>
                        <Tag>{item.category}</Tag>
                        {item.subcategory && <Tag>{item.subcategory}</Tag>}
                      </RentalTags>
                    )}
                    <RentalInfo>
                      Antall: {rental.quantity} - Utlånt {new Date(rental.date).toLocaleDateString()}
                    </RentalInfo>
                  </RentalDetails>
                  <ReturnButton onClick={() => handleReturn(rental)}>Lever</ReturnButton>
                </RentalItem>
              );
            })}
          </RentalList>
        ) : (
          <p>Du har ingen aktive utlån.</p>
        )}

        <ReportButton onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? "Avbryt" : "Rapporter mistet eller ødelagt gjenstand"}
        </ReportButton>

        <AnimatePresence>
          {isFormOpen && (
            <ReportForm
              userRentals={userRentals}
              selectedRental={selectedRental}
              setSelectedRental={setSelectedRental}
              reportDetails={reportDetails}
              setReportDetails={setReportDetails}
              handleReportSubmit={handleReportSubmit}
              selectedLocation={selectedLocation} // Pass new prop
              setSelectedLocation={setSelectedLocation} // Pass new prop
            />
          )}
        </AnimatePresence>
      </ContentWrapper>
    </LeverContainer>
  );
};

export default Lever;

// Styled components (unchanged)
const LeverContainer = styled.div`
  min-height: 100vh;
  padding: 1rem;
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

const LeverTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  text-align: center;
`;

const RentalList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RentalItem = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RentalImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const RentalDetails = styled.div`
  flex-grow: 1;
`;

const RentalName = styled.p`
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const RentalInfo = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #666;
  margin-bottom: 0.25rem;
`;

const RentalTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: #fff;
  background: #1a1a1a;
  padding: 2px 8px;
  border-radius: 12px;
`;

const ReturnButton = styled.button`
  padding: 8px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }
`;

const ReportButton = styled.button`
  width: 100%;
  max-width: 300px;
  padding: 10px;
  background: #ffdd00;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 500;
  cursor: pointer;
  margin: 2rem auto;
  display: block;
  transition: background 0.3s ease;

  &:hover {
    background: #e6c700;
  }
`;