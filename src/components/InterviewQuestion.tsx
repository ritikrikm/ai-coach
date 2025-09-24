import React from "react";

type Citation = {
    url: string;
    title: string;
};

type InterviewQuestionProps = {
    question: string;
    citations: Citation[];
};

const InterviewQuestion: React.FC<InterviewQuestionProps> = ({ question, citations }) => (
    <div>
        <div className="text-lg font-semibold mb-2">{question}</div>
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
    </div>
);

export default InterviewQuestion;
