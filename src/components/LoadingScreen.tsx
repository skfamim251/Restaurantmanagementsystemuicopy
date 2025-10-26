import { motion } from "motion/react";
import { Loader2, Utensils } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Utensils className="h-12 w-12 text-primary" />
        </motion.div>
        <h2 className="text-foreground">Loading RestaurantOS...</h2>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Loader2 className="h-6 w-6 text-muted-foreground mx-auto animate-spin" />
        </motion.div>
      </motion.div>
    </div>
  );
}
