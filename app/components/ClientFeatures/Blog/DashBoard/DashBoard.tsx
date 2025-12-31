"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus, Trash2, Edit, List, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Login from "@/app/components/ClientFeatures/Login/Login";

export default function DashBoard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      // Session will be cleared automatically via onAuthStateChange
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff911d]" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl w-full relative">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </>
          )}
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Article Management Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Article Button */}
          <Link
            href="/blog/create-blogs"
            className="flex items-center justify-center gap-3 p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors transform hover:scale-105"
          >
            <FilePlus className="w-8 h-8" />
            <span className="text-xl font-semibold">Create New Article</span>
          </Link>

          {/* Delete Article Button */}
          <Link
            href="/blog/delete-blogs"
            className="flex items-center justify-center gap-3 p-8 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors transform hover:scale-105"
          >
            <Trash2 className="w-8 h-8" />
            <span className="text-xl font-semibold">Delete Article</span>
          </Link>

          {/* Update Article Button */}
          <Link
            href="/blog/update-blogs"
            className="flex items-center justify-center gap-3 p-8 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-colors transform hover:scale-105"
          >
            <Edit className="w-8 h-8" />
            <span className="text-xl font-semibold">Update Article</span>
          </Link>

          {/* Show All Articles Button */}
          <Link
            href="/blog/all-blogs"
            className="flex items-center justify-center gap-3 p-8 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors transform hover:scale-105"
          >
            <List className="w-8 h-8" />
            <span className="text-xl font-semibold">Show All Articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

