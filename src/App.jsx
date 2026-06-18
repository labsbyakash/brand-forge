import { useState, useRef, useEffect } from "react";
// Import the official Google Gen AI SDK
import { GoogleGenAI } from "@google/genai";

// These are the configuration presets for our user options
const OPTIONS = {
  industry: ["Tech", "Healthcare", "Finance", "Gaming", "Education"],
  type: ["Startup", "App", "Website", "YouTube Channel", "Product"],
  style: ["Modern", "Minimal", "Luxury", "Futuristic", "Funny"],
  language: ["English", "Hindi", "Spanish", "Japanese", "Greek", "Latin"],
};

// Hooking up the Gemini client using the environment key saved in your project setup
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

export default function App() {
  // Theme control: Starts out dark by default
  const [theme, setTheme] = useState("dark");

  // Storing what pills the user has actively selected
  const [formData, setFormData] = useState({
    industry: OPTIONS.industry[0],
    type: OPTIONS.type[0],
    style: OPTIONS.style[0],
    language: OPTIONS.language[0],
  });

  // Setting up our text references, loading triggers, error blocks, and tracking states
  const keywordsRef = useRef(null);
  const [generatedNames, setGeneratedNames] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Making sure our customized elegant typography font loads smoothly on component mount
  useEffect(() => {
    document.body.style.fontFamily = "'Outfit', sans-serif";
  }, []);

  // When a user taps an option badge/pill, update that specific field inside our form data state
  const handlePillSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Flip-flops the design interface setup back and forth between light and dark modes
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Copies the generated name to the clipboard and handles showing a brief "Copied!" text alert
  const handleCopy = (name, index) => {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null); // Resets back to the normal copy text indicator after 1.5 seconds
    }, 1500);
  };

  // ASYNC FORGE: API Call handler
  // The main core function that talks to Gemini when someone clicks the generate button
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage("");
    setGeneratedNames([]);

    // Check if the user wrote any custom keywords, otherwise apply a fallback text string
    const keywords = keywordsRef.current?.value || "none provided";

    // Structuring a bulletproof prompt instructions manual for the AI engine
    const promptText = `
      You are BrandForge AI, an elite naming engineer. 
      Generate exactly 10 unique, clever, and creative brand names for a project based on these strict guidelines:
      - Industry context: ${formData.industry}
      - Project Medium Type: ${formData.type}
      - Aesthetic Style direction: ${formData.style}
      - Linguistic Base Language: ${formData.language}
      - Target seed keywords to reference if possible: ${keywords}
      
      CRITICAL REQUIREMENT: Do NOT include domain extensions (like .com, .ai, .io) or web protocols. Provide only the raw identity names.
      Do not include numbers, hyphens, punctuation, or spaces inside the names.
      
      Respond ONLY with a valid JSON array containing exactly 10 strings. No conversational text, no markdown block wrappers besides valid JSON.
      Example format expected:
      ["NameOne", "NameTwo"]
    `;

    try {
      // Calling the Gemini 2.5 Flash model and explicitly demanding a clean JSON reply
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8, // Slightly higher creative freedom setting for cooler branding ideas
        },
      });

      const rawText = response.text;
      const parsedNames = JSON.parse(rawText);

      // Verify that Gemini actually sent back a proper array format as requested
      if (Array.isArray(parsedNames)) {
        setGeneratedNames(parsedNames.slice(0, 10)); // Making sure we slice down precisely to 10 strings max
      } else {
        throw new Error("Invalid format returned by the Forge matrix.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setErrorMessage(
        "Failed to communicate with Gemini API. Double check your API key environment settings.",
      );
    } finally {
      setIsGenerating(false); // Shuts down the loading spinner layout state
    }
  };

  // Quick conditional utility style variables to keep the layout rendering area tidy
  const isDark = theme === "dark";
  const themeBg = isDark
    ? "bg-[#050505] text-[#FAFAFA]"
    : "bg-[#FAFAFA] text-[#111827]";
  const labelColor = isDark ? "text-neutral-500" : "text-neutral-400";
  const inputBg = isDark
    ? "bg-[#171717] text-white border-white/10"
    : "bg-white text-black border-black/10";

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 relative flex flex-col ${themeBg}`}
    >
      {/* HEADER BAR */}
      <header
        className={`w-full px-6 py-4 flex justify-between items-center border-b ${isDark ? "border-white/10" : "border-black/10"}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-black px-2.5 py-1 uppercase tracking-widest border-2 ${isDark ? "border-white" : "border-black"}`}
          >
            tS
          </span>
          <h1 className="text-xl font-black uppercase tracking-tighter">
            BrandForge
          </h1>
        </div>

        {/* Global theme toggle switcher */}
        <button
          onClick={toggleTheme}
          className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
            isDark
              ? "bg-white text-black border-white hover:bg-neutral-200"
              : "bg-black text-white border-black hover:bg-neutral-800"
          }`}
        >
          {isDark ? "☀️ Light UI" : "🌙 Dark UI"}
        </button>
      </header>

      {/* ASYMMETRIC TWO-COLUMN LAYOUT */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* LEFT COLUMN: CONFIGURATION PANELS */}
        <section
          className={`lg:col-span-5 p-6 lg:p-10 border-r ${isDark ? "border-white/5" : "border-black/5"}`}
        >
          <div className="mb-8">
            <p
              className={`text-xs font-mono uppercase tracking-wider ${labelColor}`}
            >
              // Neural Parameters
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mt-1">
              Configure Parameters
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dynamically rendering pill selectors for each parameter field array */}
            {["industry", "type", "style", "language"].map((field) => (
              <div key={field} className="flex flex-col gap-2">
                <label
                  className={`text-[10px] uppercase tracking-widest font-black ${labelColor}`}
                >
                  {field}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OPTIONS[field].map((opt) => {
                    const isSelected = formData[field] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handlePillSelect(field, opt)}
                        className={`px-3 py-1.5 text-xs font-medium uppercase tracking-tight transition-all rounded-md border ${
                          isSelected
                            ? isDark
                              ? "bg-white text-black border-white font-bold"
                              : "bg-black text-white border-black font-bold"
                            : isDark
                              ? "bg-transparent text-neutral-400 border-white/10 hover:border-white/30"
                              : "bg-transparent text-neutral-600 border-black/10 hover:border-black/30"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Core Optional Keywords Input Box */}
            <div className="flex flex-col gap-2 pt-2">
              <label
                className={`text-[10px] uppercase tracking-widest font-black ${labelColor}`}
              >
                Seed Keywords <span className="opacity-50">(optional)</span>
              </label>
              <input
                type="text"
                ref={keywordsRef}
                placeholder="e.g. speed, eco, nexus"
                className={`w-full px-4 py-3 text-xs outline-none tracking-wide transition-all border-2 ${inputBg} ${
                  isDark ? "focus:border-white" : "focus:border-black"
                }`}
              />
            </div>

            {/* Main execution action trigger button */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full font-black py-4 px-6 border-2 uppercase tracking-widest text-xs transition-all duration-200 active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                isDark
                  ? "bg-white text-black border-white shadow-white/20 hover:bg-neutral-200"
                  : "bg-black text-white border-black shadow-black/10 hover:bg-neutral-900"
              } disabled:opacity-40 disabled:pointer-events-none`}
            >
              {isGenerating ? "Querying Gemini Matrix..." : "Forge Names"}
            </button>
          </form>
        </section>

        {/* RIGHT PANEL COLUMN: GENERATION RESULTS OUTPUT TARGET */}
        <section
          className={`lg:col-span-7 p-6 lg:p-10 flex flex-col justify-between ${isDark ? "bg-[#0b0b0b]" : "bg-[#f5f5f5]"}`}
        >
          {/* Engine layout info bar status tracker */}
          <div className="flex justify-between items-start opacity-60 text-[11px] font-mono border-b pb-4 border-dashed border-neutral-500/20">
            <span>STATUS // {isGenerating ? "COMPUTING LABELS" : "READY"}</span>
            <span>ENGINE // GEMINI-2.5-FLASH</span>
          </div>

          {/* Core dynamic content window layout layer */}
          <div className="my-auto py-10">
            {/* Renders error text alerts safely if something breaks or goes wrong */}
            {errorMessage && (
              <div className="mb-6 p-4 border-2 border-red-500/30 bg-red-500/5 text-red-400 text-xs font-mono">
                [ERROR] // {errorMessage}
              </div>
            )}

            {/* The animated layout loader block when waiting on the API call data */}
            {isGenerating && (
              <div className="flex flex-col gap-2 max-w-sm">
                <div className="text-sm font-black animate-pulse tracking-widest uppercase">
                  // Striking the Forge...
                </div>
                <div className="w-full h-0.5 bg-neutral-500/20 relative overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full w-1/3 animate-[loading_1s_infinite] ${isDark ? "bg-white" : "bg-black"}`}
                    style={{
                      animationName: "shimmer",
                      animationDuration: "1.5s",
                      animationIterationCount: "infinite",
                    }}
                  ></div>
                </div>
                <style>{`
                  @keyframes shimmer {
                    0% { left: -33%; }
                    100% { left: 100%; }
                  }
                `}</style>
              </div>
            )}

            {/* Empty default state display message if no names exist yet */}
            {!isGenerating && generatedNames.length === 0 && (
              <div className="max-w-md">
                <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter opacity-15 select-none leading-none mb-4">
                  No Identity Forged Yet
                </h3>
                <p
                  className={`text-xs tracking-wide leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                >
                  Fill the parameters on the left engine panel, and click "Forge
                  Names" to directly query Gemini for 10 raw product and brand
                  concept outputs.
                </p>
              </div>
            )}

            {/* Output Matrix layout renderer logic block */}
            {!isGenerating && generatedNames.length > 0 && (
              <div className="space-y-3">
                <h3
                  className={`text-[10px] uppercase font-black tracking-widest ${labelColor} mb-5`}
                >
                  Forged Identity Output Matrix ({generatedNames.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                  {generatedNames.map((name, index) => {
                    const isCopied = copiedIndex === index;
                    return (
                      <div
                        key={index}
                        onClick={() => handleCopy(name, index)}
                        className={`p-4 border-2 flex justify-between items-center group transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer ${
                          isCopied
                            ? isDark
                              ? "bg-emerald-950/30 border-emerald-500 text-emerald-400"
                              : "bg-emerald-50 border-emerald-600 text-emerald-700"
                            : isDark
                              ? "bg-[#121212] border-white/10 hover:border-white text-white"
                              : "bg-white border-black/10 hover:border-black text-black"
                        }`}
                      >
                        <span className="text-sm font-black tracking-tight font-mono">
                          {name}
                        </span>

                        {/* Dynamic contextual interactive styling for the copy visual confirmation indicator */}
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 tracking-wider rounded transition-all duration-150 ${
                            isCopied
                              ? "bg-emerald-500 text-white opacity-100"
                              : isDark
                                ? "bg-white text-black opacity-0 group-hover:opacity-100"
                                : "bg-black text-white opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {isCopied ? "Copied!" : "Copy"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer design layout element section */}
          <div
            className={`pt-4 border-t border-dashed border-neutral-500/20 text-[10px] uppercase font-mono tracking-widest flex justify-between ${labelColor}`}
          >
            <span>
              Made `BrandForge` with 💖 by -{" "}
              <a
                href="https://devakashsharma.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline cursor-pointer"
              >
                Akash
              </a>
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
