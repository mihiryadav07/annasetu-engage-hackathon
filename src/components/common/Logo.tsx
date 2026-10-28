import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
}) => {
  const imgHeight = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-8 sm:h-9';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Authentic AnnaSetu Bridge Emblem with interactive spring motion */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-stone-200/90 bg-[#FAF7F0] shadow-xs px-2.5 py-1.5"
      >
        <img
          src="/assets/aistudio/image_5a7fa1c3.png"
          alt="AnnaSetu Emblem"
          className={`${imgHeight} w-auto object-contain`}
        />
      </motion.div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-serif font-black tracking-tight text-emerald-950 text-xl md:text-2xl leading-none">
            Anna<span className="text-amber-600">Setu</span>
          </span>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
            India
          </span>
        </div>
        {showTagline && (
          <span className="text-stone-500 font-sans text-xs tracking-tight font-medium mt-0.5">
            Every Meal Find its Way
          </span>
        )}
      </div>
    </div>
  );
};
