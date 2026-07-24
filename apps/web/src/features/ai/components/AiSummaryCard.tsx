import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGenerateSummary } from '../hooks/use-ai';
import { motion, AnimatePresence } from 'framer-motion';

interface AiSummaryCardProps {
  workspaceId: string;
  textToSummarize: string;
  existingSummary?: string;
  onSummaryGenerated?: (summary: string) => void;
  onDismiss?: () => void;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  workspaceId,
  textToSummarize,
  existingSummary,
  onSummaryGenerated,
  onDismiss,
}) => {
  const { mutate: generateSummary, isPending, data, error } = useGenerateSummary(workspaceId);

  const displayedSummary = data?.summary || existingSummary;

  const handleGenerate = () => {
    generateSummary(textToSummarize, {
      onSuccess: (res) => {
        if (onSummaryGenerated) {
          onSummaryGenerated(res.summary);
        }
      },
    });
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Summary
        </CardTitle>
        <div className="flex items-center gap-1">
          {displayedSummary && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full"
              onClick={handleGenerate}
              disabled={isPending}
            >
              <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-indigo-600/70 dark:text-indigo-400/70"
            >
              <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              Generating insights...
            </motion.div>
          ) : displayedSummary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              {displayedSummary}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              Failed to generate summary. Please try again.
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start gap-3"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generate an AI-powered summary to quickly grasp the key points.
              </p>
              <Button 
                onClick={handleGenerate} 
                size="sm" 
                variant="outline"
                className="bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2 text-purple-500" />
                Summarize
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
