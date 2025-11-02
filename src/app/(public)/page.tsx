"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

import { createSession } from "@/utils/session";
import { postJSON } from "@/utils/api";

type Skill = {
    skill: string;
    subskills: string[];
};
type skill = {
    id: string;
    name: string;
    
}
type subskills = {
    id: string;
    skill_id: string;
    name: string;
}
interface CompetencyResponse {
    skills: skill[];
    subskills: subskills[];
}

export default function LandingPage() {
    const [role, setRole] = useState<string>("");
    const [jd, setJd] = useState<string>("");
    const [skills, setSkills] = useState<Skill[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSkills(null);
        try {
            const resp = await postJSON<{ ok: boolean; data: CompetencyResponse }>("/api/competency", { jd });
            if (!resp.ok) throw new Error("Failed to analyze JD");
            // Map skills and subskills from the new response shape
            // resp.data.skills: [{ id, name, ... }], resp.data.subskills: [{ id, skill_id, name, ... }]
            const skillsArr = Array.isArray(resp.data?.skills) ? resp.data.skills : [];
            const subskillsArr = Array.isArray(resp.data?.subskills) ? resp.data.subskills : [];
            // Group subskills by skill_id
            const subskillsBySkill: Record<string, string[]> = {};
            for (const sub of subskillsArr) {
                if (!subskillsBySkill[sub.skill_id]) subskillsBySkill[sub.skill_id] = [];
                subskillsBySkill[sub.skill_id].push(sub.name);
            }
            // Build Skill[] as expected by the rest of the code
            const mappedSkills: Skill[] = skillsArr.map((skill: skill) => ({
                skill: skill.name,
                subskills: subskillsBySkill[skill.id] || [],
            }));
            setSkills(mappedSkills);
        } catch (err: unknown) {
            if(err instanceof Error){     
                setError(err.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartInterview = async () => {
        setLoading(true);
        setError(null);
        try {
            const { id } = await createSession(role, jd);
            router.push(`/session/${id}`);
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message || "Failed to start interview");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Start Your AI Mock Interview
                </h1>
                <form onSubmit={handleAnalyze} className="space-y-4">
                    <Input
                        label="Role"
                        placeholder="e.g. Frontend Engineer"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        required
                    />
                    <Textarea
                        label="Job Description"
                        placeholder="Paste the job description here..."
                        value={jd}
                        onChange={e => setJd(e.target.value)}
                        rows={6}
                        required
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Analyzing..." : "Analyze JD"}
                    </Button>
                </form>
                {error && (
                    <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
                )}
                {skills && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-3">Identified Skills</h2>
                        {skills.length === 0 ? (
                            <div className="text-gray-500">No skills found.</div>
                        ) : (
                            <ul className="space-y-4">
                                {skills.map((s, idx) => (
                                    <li key={idx}>
                                        <div className="font-bold">{s.skill}</div>
                                        <div className="text-gray-700 text-sm">
                                            {s.subskills && s.subskills.length > 0
                                                ? s.subskills.join(", ")
                                                : <span className="text-gray-400">No subskills</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            className="mt-6 w-full"
                            onClick={handleStartInterview}
                            disabled={loading}
                        >
                            {loading ? "Starting..." : "Start Interview"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
