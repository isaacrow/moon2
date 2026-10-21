import React, { useState } from 'react';
import { X, Mic, Send, Sparkles, Box, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ARTIFACT_RECORDS } from './data/records';

const SAMPLE_PROMPTS = {
  ar: [
    "ما هي أقدم قطعة أثرية في المجموعة؟",
    "اشرح لي أهمية خريطة بابل للعالم (إيماجو موندي)",
    "أين يُحفظ مخطوط القبسات للميرداماد؟",
    "كيف يربط معيار BIBFRAME 2.0 بين النموذج ثلاثي الأبعاد والعمل الفكري؟"
  ],
  en: [
    "What is the oldest artifact in the collection?",
    "Explain the significance of the Babylonian Map of the World",
    "Where is the Al-Qabasat manuscript preserved?",
    "How does BIBFRAME 2.0 represent 3D digital surrogates?"
  ]
};

export default function AskAIModal({ onClose, onSelectArtifact, lang }) {
  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: isAr 
        ? "أهلاً بك في فضاء ذكاء علقمي المرتبط بقاعدة بيانات مون (Moon DB). يمكنك سؤالي عن تاريخ أي قطعة، قراءة نقوشها، أو استكشاف علاقاتها في شبكة البيانات المترابطة (BIBFRAME 2.0)."
        : "Welcome to Alqami Spatial Intelligence linked with Moon DB. Ask me about historical provenance, cuneiform or Arabic inscriptions, or BIBFRAME 2.0 graph triples."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAsk = (promptText) => {
    const textToSubmit = promptText || query;
    if (!textToSubmit.trim()) return;

    const userMsg = { role: 'user', text: textToSubmit };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let answer = "";
      let matchedArtifact = null;
      const lower = textToSubmit.toLowerCase();

      if (lower.includes('بابل') || lower.includes('خريطة') || lower.includes('أقدم') || lower.includes('map') || lower.includes('oldest')) {
        matchedArtifact = ARTIFACT_RECORDS.find(a => a.id === 'ALQ-MAP-001');
        answer = isAr 
          ? "أقدم قطعة هي **خريطة بابل للعالم (إيماجو موندي)** تعود للقرن الخامس أو السادس قبل الميلاد (لوح طيني مفخور). تمثل بابل في المركز ويحيط بها نهر الفرات ومحيط المرارة المالح وسبع مناطق أسطورية. رقم السجل في بيبفرام هو `GA205 .B33`."
          : "The oldest artifact is the **Babylonian Map of the World (Imago Mundi)** from the 6th–5th century BCE. It depicts Babylon centered along the Euphrates, ringed by the Bitter River and mythic realms. Cataloged under LCC `GA205 .B33`.";
      } else if (lower.includes('قبسات') || lower.includes('ميرداماد') || lower.includes('مخطوط') || lower.includes('qabasat')) {
        matchedArtifact = ARTIFACT_RECORDS.find(a => a.id === 'ALQ-MAN-005');
        answer = isAr
          ? "مخطوط **القبسات للميرداماد** (نسخة 1061 هـ / 1650 م) محفوظ في مكتبة مجلس الشورى (برقم 4662) وهو مفهرس ضمن نظام مكتبات مون. يناقش الكتاب مسألة حدوث العالم ودهريته."
          : "The **Al-Qabasat Manuscript by Mir Damad** (dated 1061 AH / 1650 CE) is held at the Majlis Library (#4662), connected via the Moon Library Linked Data system.";
      } else if (lower.includes('ذو الفقار') || lower.includes('سيف') || lower.includes('sword') || lower.includes('zulfiqar')) {
        matchedArtifact = ARTIFACT_RECORDS.find(a => a.id === 'ALQ-SWD-002');
        answer = isAr
          ? "سيف **ذو الفقار التاريخي** مصنوع من فولاذ الجوهر الدمشقي ومطعم بالفضة والذهب. يتميز بالرأس المشقوق المزدوج ومصنف في بيبفرام تحت موضوع الإمام علي (ع) والدروع والأسلحة الإسلامية."
          : "The **Zulfiqar Sword** is crafted in crucible Damascus steel inlaid with pure silver filigree. Cataloged with LCSH authority for Imam Ali (a.s.) and Islamic arms.";
      } else if (lower.includes('bibframe') || lower.includes('surrogate') || lower.includes('بيانات')) {
        answer = isAr
          ? "في معيار **BIBFRAME 2.0**، يُعرف النموذج ثلاثي الأبعاد (.glb) كـ `schema:digitalSurrogate` أو `bf:electronicLocator` مرتبط بكيان `bf:Instance`، بينما يحمل `bf:Work` الخصائص الفكرية والتاريخية والموضوعات المقننة (LCSH)."
          : "In **BIBFRAME 2.0**, a 3D GLB model is encoded as a `schema:digitalSurrogate` attached to the `bf:Instance` level, while `bf:Work` captures intellectual authorship and LCSH subjects.";
      } else {
        matchedArtifact = ARTIFACT_RECORDS[0];
        answer = isAr
          ? `بناءً على سجلات الفهرس المترابط، تم العثور على مقتنيات ذات صلة في التراث الإسلامي والعراقي القديم. يمكنك معاينة أي نموذج مباشرة في الواقع المعزز 3D.`
          : `Based on Moon Woolf Linked Data records, multiple artifacts match your query across Islamic and Mesopotamian heritage. Select below to inspect in 3D AR.`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: answer,
        artifact: matchedArtifact
      }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-primary rounded-[2.5rem] p-5 md:p-7 flex flex-col border border-white/20 shadow-2xl h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isAr ? 'ذكاء علقمي الفهرسي' : 'Alqami Spatial Intelligence'}
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono">
                  Moon DB
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'استكشاف دلالي للبيانات المترابطة والقطع الأثرية' : 'Semantic query agent for BIBFRAME linked heritage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-3xl text-xs md:text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-white text-black font-medium rounded-tr-sm shadow-lg' 
                  : 'bg-white/10 border border-white/10 text-slate-100 rounded-tl-sm backdrop-blur-md'
              }`}>
                {m.text}

                {/* If message links to an artifact */}
                {m.artifact && (
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-3">
                    <span className="font-semibold text-white truncate text-xs">
                      {m.artifact.title[lang]}
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectArtifact(m.artifact);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>{isAr ? 'معاينة 3D' : 'Open 3D'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-white p-2">
              <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-200"></span>
              <span className="text-slate-400 mr-2 text-[11px]">{isAr ? 'جارِ فحص ثلاثيات بيبفرام...' : 'Searching BIBFRAME triples...'}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none mb-3">
          {SAMPLE_PROMPTS[lang].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleAsk(prompt)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center">
          <div className="w-full flex items-center rounded-full bg-black/60 border border-white/25 px-4 py-2 shadow-inner">
            <span className="text-white mr-2 text-lg font-light">+</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={isAr ? "اسأل ذكاء علقمي..." : "Ask Alqami AI..."}
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />

            <div className="flex items-center gap-2 text-slate-400 ml-2">
              <button 
                onClick={() => handleAsk("أخبرني عن مقتنيات التراث في بيبفرام")}
                className="p-1.5 hover:text-white transition-colors"
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAsk()}
                disabled={!query.trim()}
                className="p-2 rounded-full bg-white disabled:opacity-30 text-black hover:bg-slate-100 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
