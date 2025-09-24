import React from "react";

type Evaluation = {
    correctness: number;
    clarity: number;
    tradeoffs: number;
    notes: string;
    weak_subskills: string[];
};

type Lesson = {
    subskill: string;
    lesson: string;
    practices: string[];
};

type Tutor = {
    lessons: Lesson[];
};

type EvaluationPanelProps = {
    evaluation: Evaluation;
    tutor: Tutor;
};

const EvaluationPanel: React.FC<EvaluationPanelProps> = ({ evaluation, tutor }) => (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-bold mb-4">Evaluation Results</h2>
        <div className="space-y-2">
            <div>
                <span className="font-medium">Correctness:</span>{" "}
                <span>{evaluation.correctness}/5</span>
            </div>
            <div>
                <span className="font-medium">Clarity:</span>{" "}
                <span>{evaluation.clarity}/5</span>
            </div>
            <div>
                <span className="font-medium">Tradeoffs:</span>{" "}
                <span>{evaluation.tradeoffs}/5</span>
            </div>
        </div>
        <div>
            <span className="font-medium">Notes:</span>
            <p className="mt-1 text-gray-700">{evaluation.notes}</p>
        </div>
        {evaluation.weak_subskills && evaluation.weak_subskills.length > 0 && (
            <div>
                <span className="font-medium">Weak Subskills:</span>
                <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
                    {evaluation.weak_subskills.map((subskill, idx) => (
                        <li key={idx}>{subskill}</li>
                    ))}
                </ul>
            </div>
        )}
        <h3 className="text-lg font-semibold mt-6 mb-2">Tutor Suggestions</h3>
        <div className="space-y-4">
            {tutor.lessons.map((lesson, idx) => (
                <div key={idx} className="border rounded p-4 bg-gray-50">
                    <div className="font-bold text-blue-800 mb-1">
                        Subskill: {lesson.subskill}
                    </div>
                    <div className="mb-2">{lesson.lesson}</div>
                    {lesson.practices && lesson.practices.length > 0 && (
                        <ul className="list-disc list-inside ml-4 text-sm text-gray-700">
                            {lesson.practices.map((practice, i) => (
                                <li key={i}>{practice}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default EvaluationPanel;
