"use client";

import { useEffect, useState } from "react";
import { Progress } from "@heroui/progress";
import { Card, CardBody } from "@heroui/card";
import { Spacer } from "@heroui/spacer";
import { useParams, useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableColumn, TableBody, TableCell, TableRow } from "@heroui/table";

import { Session } from "@/types";
import { db } from "@/firebase/firebaseConfig";
import { SESSION_COLLECTION } from "@/config/firebaseStorage";
import { QUESTIONS } from "@/config/questions";

// SVG laurel branches for decorating the final score
const LeftLaurelBranch = ({ colorClass = "text-amber-500" }) => (
  <svg
    className={`w-12 h-24 ${colorClass}`}
    fill="currentColor"
    viewBox="0 0 100 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M90,100 C90,120 70,140 50,150 C70,130 80,110 90,100 Z" />
    <path d="M90,100 C90,80 70,60 50,50 C70,70 80,90 90,100 Z" />
    <path d="M70,100 C70,115 55,130 40,135 C55,120 65,105 70,100 Z" />
    <path d="M70,100 C70,85 55,70 40,65 C55,80 65,95 70,100 Z" />
    <path d="M55,100 C55,110 45,120 35,122 C45,112 52,102 55,100 Z" />
    <path d="M55,100 C55,90 45,80 35,78 C45,88 52,98 55,100 Z" />
  </svg>
);

const RightLaurelBranch = ({ colorClass = "text-amber-500" }) => (
  <svg
    className={`w-12 h-24 ${colorClass}`}
    fill="currentColor"
    viewBox="0 0 100 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10,100 C10,120 30,140 50,150 C30,130 20,110 10,100 Z" />
    <path d="M10,100 C10,80 30,60 50,50 C30,70 20,90 10,100 Z" />
    <path d="M30,100 C30,115 45,130 60,135 C45,120 35,105 30,100 Z" />
    <path d="M30,100 C30,85 45,70 60,65 C45,80 35,95 30,100 Z" />
    <path d="M45,100 C45,110 55,120 65,122 C55,112 48,102 45,100 Z" />
    <path d="M45,100 C45,90 55,80 65,78 C55,88 48,98 45,100 Z" />
  </svg>
);

// Animated number component with slot machine effect
const AnimatedNumber = ({ value, className = "" }: { value: number; className?: string }) => {
  const stringValue = value.toFixed(1);

  return (
    <div className={`flex ${className}`}>
      {stringValue.split("").map((digit, index) => (
        <motion.div
          key={`digit-${index}`}
          className="overflow-hidden inline-block relative"
          style={{ width: digit === "." ? "0.5em" : "0.65em", height: "1.2em" }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`${index}-${digit}`}
              animate={{ y: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              exit={{ y: 60 }}
              initial={{ y: -60 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.05 + 0.1,
                mass: 0.8,
              }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default function ResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const fromHistory = searchParams.get("from") === "history";

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [totalAverage, setTotalAverage] = useState<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState(fromHistory ? 100 : 0); // Skip animation if coming from history

  useEffect(() => {
    const sessionRef = doc(db, SESSION_COLLECTION, sessionId);

    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setSession(doc.data() as Session);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [sessionId]);

  useEffect(() => {
    if (session && session.guests.length >= session.numberOfGuests) {
      calculateAverages();
    }
  }, [session]);

  const calculateAverages = () => {
    if (!session || session.guests.length === 0) return;

    const totals = session.guests.reduce(
      (acc, guest) => {
        Object.keys(guest.votes).forEach((key) => {
          const voteKey = key as keyof typeof guest.votes;

          acc[voteKey] = (acc[voteKey] || 0) + guest.votes[voteKey];
        });

        return acc;
      },
      {} as Record<string, number>
    );

    const averages = Object.keys(totals).reduce(
      (acc, key) => {
        acc[key] = totals[key] / session.guests.length;

        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate total average
    const total = Object.values(averages).reduce((sum, value) => sum + value, 0);

    setTotalAverage(total / Object.keys(averages).length);
    setAverages(averages);
  };

  // Suspense effect: Show one line every 3 seconds
  useEffect(() => {
    if (!loading && Object.keys(averages).length > 0 && !fromHistory) {
      const interval = setInterval(() => {
        setDisplayIndex((prevIndex) =>
          prevIndex < Object.keys(averages).length ? prevIndex + 1 : prevIndex
        );
      }, 3000); // 3 seconds for each line

      return () => clearInterval(interval);
    }
  }, [averages, loading, fromHistory]);

  const sortedGuests = session
    ? [...session.guests].sort((a, b) => {
        const totalVotesA = Object.values(a.votes).reduce((acc, vote) => acc + vote, 0);
        const totalVotesB = Object.values(b.votes).reduce((acc, vote) => acc + vote, 0);

        return totalVotesB - totalVotesA;
      })
    : [];

  // Function to get the rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 4.5) return "success";
    if (score >= 3.5) return "primary";
    if (score >= 2.5) return "warning";

    return "danger";
  };

  // Function to get the rating text based on score
  const getRatingText = (score: number) => {
    if (score >= 4.5) return "Excellent";
    if (score >= 3.5) return "Good";
    if (score >= 2.5) return "Average";
    if (score >= 1.5) return "Poor";

    return "Bad";
  };

  // Function to get the medal theme based on score
  const getMedalTheme = (score: number) => {
    if (score >= 4)
      return {
        background: "bg-gradient-to-br from-amber-50 to-amber-100",
        border: "border-amber-200",
        text: "text-amber-900",
        score: "text-amber-800",
        laurel: "text-amber-500",
      };
    if (score >= 3)
      return {
        background: "bg-gradient-to-br from-slate-50 to-slate-200",
        border: "border-slate-300",
        text: "text-slate-900",
        score: "text-slate-800",
        laurel: "text-slate-400",
      };

    return {
      background: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-900",
      score: "text-orange-800",
      laurel: "text-orange-400",
    };
  };

  // Calculate partial average based on displayed categories
  const getPartialAverage = () => {
    if (Object.keys(averages).length === 0) return 0;

    const displayedCategories = QUESTIONS.slice(0, displayIndex).map((q) => q.key);

    if (displayedCategories.length === 0) return 0;

    const sum = displayedCategories.reduce((acc, key) => acc + (averages[key] || 0), 0);

    return sum / displayedCategories.length;
  };

  // For history view, add a brief initial loading state for dramatic effect
  const [showHistoryScore, setShowHistoryScore] = useState(false);

  useEffect(() => {
    // Add a brief delay before showing the final score when coming from history
    if (fromHistory && !loading && totalAverage !== null && !showHistoryScore) {
      const timer = setTimeout(() => {
        setShowHistoryScore(true);
      }, 1500); // 1.5 seconds of suspense

      return () => clearTimeout(timer);
    }
  }, [fromHistory, loading, totalAverage, showHistoryScore]);

  // For easier tracking in view
  const displayedScore =
    fromHistory || displayIndex >= QUESTIONS.length
      ? totalAverage
      : displayIndex > 0
        ? getPartialAverage()
        : 0;

  // Always start with bronze theme even when score is 0
  const theme =
    displayedScore === 0
      ? {
          background: "bg-gradient-to-br from-orange-50 to-orange-100",
          border: "border-orange-200",
          text: "text-orange-900",
          score: "text-orange-800",
          laurel: "text-orange-400",
        }
      : getMedalTheme(displayedScore || 0);

  return (
    <div className="flex justify-center items-center w-full">
      {loading ? (
        <h2 className="text-center text-xl">Loading...</h2>
      ) : session && session.guests.length < session.numberOfGuests ? (
        <Card className="max-w-md w-full p-6">
          <div className="flex flex-col items-center mb-4">
            <AvatarGroup isBordered>
              {session.guests.map((guest) => (
                <Avatar key={guest.name} src={guest.photoURL} />
              ))}
            </AvatarGroup>
          </div>
          <Progress
            color="primary"
            value={(session.guests.length / session.numberOfGuests) * 100}
          />
          <Spacer y={1.5} />
          <h2 className="text-center text-xl">Waiting for all guests to vote...</h2>
          <p className="text-center">
            {session.guests.length} / {session.numberOfGuests} votes received
          </p>
        </Card>
      ) : Object.entries(averages).length < 3 ? (
        <h2 className="text-center text-xl">Calculating...</h2>
      ) : (
        <div className="flex flex-col items-center w-full px-4">
          {/* Restaurant name */}
          <h2 className="text-center text-2xl font-bold mb-2 mt-4">{session?.name}</h2>

          {/* Final Score Display - Visible with animation based on displayed categories */}
          {totalAverage !== null && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Handle different states of score display */}
              {fromHistory && !showHistoryScore ? (
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-xl mb-8">
                  <CardBody className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <LeftLaurelBranch colorClass="text-slate-300" />
                      <div className="flex flex-col items-center px-4">
                        <span className="text-xl font-semibold text-slate-700">Final Score</span>
                        <div className="h-20 flex items-center justify-center">
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            className="text-2xl text-slate-600 mt-3"
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          >
                            Calculating...
                          </motion.div>
                        </div>
                      </div>
                      <RightLaurelBranch colorClass="text-slate-300" />
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <motion.div
                  key={`score-card-${Math.floor(displayedScore || 0)}`}
                  animate={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className={`${theme.background} border ${theme.border} shadow-xl mb-8 transition-all duration-500`}
                  >
                    <CardBody className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <LeftLaurelBranch colorClass={theme.laurel} />
                        <div className="flex flex-col items-center px-4">
                          <span className={`text-xl font-semibold ${theme.text}`}>
                            {fromHistory || displayIndex >= QUESTIONS.length
                              ? "Final Score"
                              : "Current Score"}
                          </span>
                          <div className="h-20 flex items-center justify-center overflow-hidden">
                            {displayedScore === 0 ? (
                              <span className={`text-5xl font-bold ${theme.score} opacity-60 my-2`}>
                                -
                              </span>
                            ) : (
                              <AnimatedNumber
                                className={`text-5xl font-bold ${theme.score} my-2`}
                                value={displayedScore || 0}
                              />
                            )}
                          </div>
                          {displayedScore && displayedScore > 0 && (
                            <motion.div
                              animate={{ opacity: 1, y: 0 }}
                              initial={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                            >
                              <Chip
                                className="mt-2"
                                color={getRatingColor(displayedScore || 0)}
                                variant="flat"
                              >
                                {getRatingText(displayedScore || 0)}
                              </Chip>
                            </motion.div>
                          )}
                        </div>
                        <RightLaurelBranch colorClass={theme.laurel} />
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Category Scores */}
          <h3 className="text-xl font-semibold mt-4 mb-3">Category Scores</h3>
          <div className="w-full max-w-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUESTIONS.map(({ key, question }, index) => (
                <motion.div
                  key={key}
                  animate={index < displayIndex ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.5,
                    delay: fromHistory
                      ? showHistoryScore
                        ? 0.2 + index * 0.1
                        : 2.0 + index * 0.1
                      : index * 0.2,
                    ease: "easeOut",
                  }}
                >
                  <Card className="w-full">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{question}</span>
                        <motion.div
                          key={`category-score-${Math.floor(averages[key] * 10)}`}
                          animate={{ scale: 1, opacity: 1 }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Chip color={getRatingColor(averages[key])} size="sm" variant="flat">
                            {averages[key].toFixed(1)}
                          </Chip>
                        </motion.div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Diners Section */}
          {(displayIndex >= Object.keys(averages).length || (fromHistory && showHistoryScore)) && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md mt-10"
              initial={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.5,
                delay: fromHistory ? (showHistoryScore ? 0.8 : 2.5) : 0.5,
              }}
            >
              <h3 className="text-xl font-semibold mb-3">Diners</h3>
              <div className="w-full overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <Table
                    isStriped
                    aria-label="Leaderboard table"
                    classNames={{
                      wrapper: "min-w-full w-max",
                      table: "min-w-[300px] w-full",
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="whitespace-nowrap w-[70px]">Avatar</TableColumn>
                      <TableColumn className="whitespace-nowrap w-[140px]">Name</TableColumn>
                      <TableColumn className="whitespace-nowrap w-[90px] text-center">
                        Total Score
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      {sortedGuests &&
                        sortedGuests.map((guest, idx) => {
                          const totalVotes = Object.values(guest.votes).reduce(
                            (acc, vote) => acc + vote,
                            0
                          );
                          const avgScore = totalVotes / Object.keys(guest.votes).length;

                          return (
                            <TableRow key={idx} className="hover:bg-gray-50">
                              <TableCell key={`avatar-${idx}`} className="w-[70px]">
                                <Avatar size="sm" src={guest.photoURL} />
                              </TableCell>
                              <TableCell className="truncate max-w-[140px]">{guest.name}</TableCell>
                              <TableCell className="text-center">
                                <Chip color={getRatingColor(avgScore)} size="sm" variant="flat">
                                  {avgScore.toFixed(1)}
                                </Chip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
