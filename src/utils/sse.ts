export function useSSE({
  url,
  body,
  onData,
  onDone,
  onError,
}: {
  url: string;
  body: any;
  onData: (chunk: string) => void;
  onDone?: () => void;
  onError?: (err: any) => void;
}) {
  const abortController = new AbortController();

  (async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          onData(chunk);
        }
        done = doneReading;
      }

      if (onDone) onDone();
    } catch (err: any) {
      if (err.name === "AbortError") {
        // Request was cancelled, do not call onError
        return;
      }
      if (onError) onError(err);
    }
  })();

  return {
    cancel: () => abortController.abort(),
  };
}
