'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import { postJSON } from '@/utils/api';

type Citation = { url: string; title: string };
type Evaluation = {
    correctness: number;
    clarity: number;
    tradeoffs: number;
    notes: string;
    weak_subskills: string[];
};
type Tutor = {
    lessons: Array<{
        subskill: string;
        lesson: string;
        practices: string[];
    }>;
};

export default function SessionPage() {
    const params = useParams<{ id: string }>();
    const [question, setQuestion] = useState<string>('');
    const [citations, setCitations] = useState<Citation[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [evaluation, setEvaluation] = useState<null | Evaluation>(null);
    const [tutor, setTutor] = useState<null | Tutor>(null);
    const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
    const [loadingEval, setLoadingEval] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const turnIdRef = useRef<string>('');

    // Fetch next question via SSE
    async function fetchNextQuestion() {
        setLoadingQuestion(true);
        setEvaluation(null);
        setTutor(null);
        setError(null);
        setQuestion('');
        setCitations([]);
        setAnswer('');
        turnIdRef.current = ''; // Will be set after /api/turns

        try {
            // Use EventSource for SSE, but since POST is not supported by EventSource,
            // we use fetch with ReadableStream for this mockup.
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({
                    action: 'next-question',
                    sessionId: params.id,
                    role: 'Frontend (React)',
                }),
            });

            if (!response.body) {
                setError('No response body');
                setLoadingQuestion(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulated = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });

                    // Parse SSE lines
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('data:')) {
                            const text = line.replace(/^data:\s*/, '').trim();
                            if (!text || text === '[DONE]') continue; // skip control signals
                            // Add a space after every word in the text
                            const spacedText = text.split(' ').map(word => word + ' ').join('');
                            accumulated += spacedText;
                            setQuestion(accumulated);
                        }
                        // ignore lines starting with "event:" or empty lines
                    }
                }
                done = doneReading;
            }


            // Try to get citations from header, else mock
            let citations: Citation[] = [];
            const header = response.headers.get('X-Citations');
            if (header) {
                try {
                    citations = JSON.parse(header);
                } catch {
                    citations = [];
                }
            } else {
                // Mock citations
                citations = [
                    {
                        url: 'https://react.dev/learn',
                        title: 'React Official Docs',
                    },
                ];
            }
            setCitations(citations);

            // After SSE finishes and we have question/citations, persist the turn
            try {
                const res = await postJSON<{ ok: boolean; data: { turn: { id: string } } }>('/api/turns', {
                    sessionId: params.id,
                    question: accumulated,
                    citations,
                });
                // The API returns { ok: true, data: { turn: { id, ... } } }
                if (res && res.data && res.data.turn && res.data.turn.id) {
                    turnIdRef.current = res.data.turn.id;
                    console.log('ID IS', res.data.turn.id);
                } else {
                    // fallback to empty string if not present
                    turnIdRef.current = '';
                }
            } catch (err) {
                // If persisting the turn fails, still allow the user to continue, but no turnId
                turnIdRef.current = '';
            }
        } catch (err: any) {
            setError('Failed to fetch question.');
        } finally {
            setLoadingQuestion(false);
        }
    }

    // Submit answer for evaluation
    async function submitAnswer() {
        setLoadingEval(true);
        setError(null);
        setEvaluation(null);
        setTutor(null);

        try {
            console.log({
                action: 'evaluate',
                turnId: turnIdRef.current,
                role: 'Frontend (React)',
                question,
                answer,
            })
            const res = await postJSON<{
                evaluation: Evaluation;
                tutor: Tutor;
            }>('/api/ask', {
                action: 'evaluate',
                turnId: turnIdRef.current,
                role: 'Frontend (React)',
                question,
                answer,
            });

            setEvaluation(res.evaluation ?? null);
            setTutor(res.tutor ?? null);
        } catch (err: any) {
            setError('Failed to evaluate answer.');
        } finally {
            setLoadingEval(false);
        }
    }

    // Optionally, fetch the first question on mount
    useEffect(() => {
        fetchNextQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Mock Interview Session</h1>

            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Current Question</h2>
                <div className="min-h-[3rem] flex items-center">
                    {loadingQuestion ? (
                        <div style={{ width: 24, height: 24 }}>
                            <Spinner />
                        </div>
                    ) : question ? (
                        <span className="text-base">{question}</span>
                    ) : (
                        <span className="text-gray-500">No question loaded.</span>
                    )}
                </div>
                {citations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {citations.map((c, i) => (
                            <a
                                key={i}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-sm"
                            >
                                {c.title}
                            </a>
                        ))}
                    </div>
                )}
            </section>

            <section className="mb-6">
                <Textarea
                    className="w-full min-h-[100px] mb-2"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    disabled={loadingQuestion || loadingEval}
                />
                <div className="flex gap-2">
                    <Button
                        onClick={submitAnswer}
                        disabled={
                            loadingQuestion ||
                            loadingEval ||
                            !answer.trim() ||
                            !question.trim()
                        }
                    >
                        {loadingEval ? (
                            <span style={{ width: 16, height: 16, display: "inline-block" }}>
                                <Spinner />
                            </span>
                        ) : 'Submit Answer'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={fetchNextQuestion}
                        disabled={loadingQuestion || loadingEval}
                    >
                        Next Question
                    </Button>
                </div>
                {error && (
                    <div className="text-red-600 mt-2 text-sm">{error}</div>
                )}
            </section>

            {evaluation && (
                <section className="mb-6 border rounded p-4 bg-gray-50">
                    <h3 className="font-semibold mb-2">Evaluation</h3>
                    <div className="flex flex-wrap gap-4 mb-2">
                        <div>
                            <span className="font-medium">Correctness:</span>{' '}
                            {evaluation.correctness}/5
                        </div>
                        <div>
                            <span className="font-medium">Clarity:</span>{' '}
                            {evaluation.clarity}/5
                        </div>
                        <div>
                            <span className="font-medium">Tradeoffs:</span>{' '}
                            {evaluation.tradeoffs}/5
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="font-medium">Notes:</span>{' '}
                        <span>{evaluation.notes}</span>
                    </div>
                    {evaluation.weak_subskills.length > 0 && (
                        <div>
                            <span className="font-medium">Weak Subskills:</span>
                            <ul className="list-disc list-inside ml-4">
                                {evaluation.weak_subskills.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {tutor && (
                <section className="mb-6 border rounded p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2">Tutor Feedback</h3>
                    {tutor.lessons.map((lesson, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="font-medium text-blue-800">
                                Subskill: {lesson.subskill}
                            </div>
                            <div className="mb-1">{lesson.lesson}</div>
                            {lesson.practices.length > 0 && (
                                <ul className="list-disc list-inside ml-4 text-sm">
                                    {lesson.practices.map((p, i) => (
                                        <li key={i}>{p}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
