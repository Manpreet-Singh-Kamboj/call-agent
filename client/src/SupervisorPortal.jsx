import React, { useEffect, useState } from "react";

const ws = new WebSocket("ws://localhost:4000");

export default function SupervisorPortal() {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [questionId, setQuestionId] = useState(null);

  useEffect(() => {
    ws.onopen = () => {
      console.log("WebSocket connected ✅");
    };

    ws.onmessage = (event) => {
      console.log("Message received:", event); // <-- Important
      const data = JSON.parse(event.data);
      if (data.type === "supervisor-question") {
        setQuestion(data.questionText);
        setQuestionId(data.questionId);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error ❌", err);
    };

    ws.onclose = () => {
      console.warn("WebSocket closed ❌");
    };
  }, []);

  const sendAnswer = () => {
    if (answer && questionId) {
      ws.send(
        JSON.stringify({
          type: "supervisor-response",
          questionId,
          answer,
        })
      );
      setQuestion(null);
      setAnswer("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-[400px]">
      <h2 className="text-2xl font-bold mb-4">Supervisor Portal</h2>
      {question ? (
        <>
          <p className="mb-2">
            <strong>Incoming question:</strong> {question}
          </p>
          <input
            type="text"
            placeholder="Your answer"
            className="border p-2 w-full mb-3 rounded"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={sendAnswer}
          >
            Submit Answer
          </button>
        </>
      ) : (
        <p className="text-gray-600">No incoming questions yet.</p>
      )}
    </div>
  );
}
