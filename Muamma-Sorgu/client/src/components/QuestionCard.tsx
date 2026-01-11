import { motion } from "framer-motion";
import { type Question } from "@shared/schema";

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/50 backdrop-blur-sm border border-stone-200 p-8 rounded-sm shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex flex-col h-full justify-between gap-6">
        <h3 className="text-xl md:text-2xl font-serif leading-relaxed text-foreground font-medium">
          {question.content}
        </h3>
        
        <div className="flex items-center gap-4 pt-4 border-t border-stone-100 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="h-px flex-1 bg-stone-300"></span>
          <p className="text-xs italic font-serif text-muted-foreground whitespace-nowrap">
            Bu bir muammadır.
          </p>
          <span className="h-px flex-1 bg-stone-300"></span>
        </div>
      </div>
    </motion.div>
  );
}
