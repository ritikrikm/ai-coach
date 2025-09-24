"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { postJSON } from "@/utils/api";

type IngestResult = {
    inserted: number;
    items: Array<{
        title: string;
        url: string;
        snippet?: string;
    }>;
};

export default function AdminIngestPage() {
    const [query, setQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<IngestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleIngest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const resp = await postJSON<{
                ok: boolean;
                data: IngestResult;
                error?: string;
            }>("/api/ingest", { query });
            if (!resp.ok) {
                throw new Error(resp.error || "Ingestion failed");
            }
            setResult(resp.data);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Admin – Ingest Interview Questions
            </h1>
            <form onSubmit={handleIngest} className="space-y-4 mb-8">
                <Input
                    label="Search Query"
                    placeholder="e.g. React interview questions"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    required
                />
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !query.trim()}
                    className="w-full flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <span style={{ display: "inline-flex", alignItems: "center" }}>
                                <span style={{ marginRight: "0.5rem" }}>
                                    <Spinner />
                                </span>
                                Running...
                            </span>
                        </>
                    ) : (
                        "Run Ingestion"
                    )}
                </Button>
            </form>
            {error && (
                <div className="mb-6 text-red-600 text-center text-sm">{error}</div>
            )}
            {result && (
                <div>
                    <div className="mb-4 font-semibold">
                        Inserted: {result.inserted} document{result.inserted !== 1 ? "s" : ""}
                    </div>
                    <div className="space-y-4">
                        {result.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="border rounded-lg p-4 bg-white shadow-sm"
                            >
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    {item.title}
                                </a>
                                {item.snippet && (
                                    <div className="text-gray-600 text-sm mt-1">{item.snippet}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
