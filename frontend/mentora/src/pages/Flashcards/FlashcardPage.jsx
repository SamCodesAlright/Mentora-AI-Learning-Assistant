import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import Flashcard from "../../components/flashcards/Flashcard";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

const FlashcardPage = () => {
  const { id: documentId } = useParams();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      const sets = response?.data || [];
      const activeSet = Array.isArray(sets) && sets.length > 0 ? sets[0] : null;
      setFlashcardSets(activeSet);
      setFlashcards(activeSet?.cards || []);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      toast.error("Failed to fetch flashcards");
      console.error("Error fetching flashcards:", error);
      setFlashcardSets(null);
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully.");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (flashcards.length === 0) return;
    handleReview(currentCardIndex);
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    if (flashcards.length === 0) return;
    handleReview(currentCardIndex);
    setIsFlipped(false);
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length,
    );
  };

  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
    } catch (error) {
      toast.error("Failed to review flashcard.");
      console.error("Error reviewing flashcard:", error);
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashCards) =>
        prevFlashCards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card,
        ),
      );
      toast.success("Flashcard starred successfully.");
    } catch (error) {
      toast.error("Failed to star flashcard.");
      console.error("Error starring flashcard:", error);
    }
  };

  const renderFlashcardContent = () => {
    if (loading)
      return (
        <div className="w-full flex justify-center py-10">
          <Spinner />
        </div>
      );

    if (flashcards.length === 0) {
      return (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl">
            <EmptyState
              title="No flashcards found"
              description="Generate flashcards from your document to start learning."
            />
          </div>
        </div>
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="w-full flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            disabled={flashcards.length <= 1}
            variant="secondary"
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className="text-sm text-neutral-600">
            {currentCardIndex + 1}/{flashcards.length}
          </span>
          <Button
            onClick={handleNextCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/flashcards`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={16} /> Back To Flashcards Page
        </Link>
      </div>
      <div className="mt-10">{renderFlashcardContent()}</div>
    </div>
  );
};

export default FlashcardPage;
