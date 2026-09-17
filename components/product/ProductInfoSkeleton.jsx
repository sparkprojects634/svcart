
const Line = ({ w = "w-full", h = "h-4" }) => (
  <div className={`bg-gray-200 rounded ${w} ${h}`} />
);

const Pill = () => (
  <div className="w-8 h-8 rounded-full bg-gray-200" />
);

const Chip = () => (
  <div className="h-9 px-6 rounded border bg-gray-100 border-gray-200" />
);

export default function ProductInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Title */}
      <Line w="w-3/4" h="h-8" />

      {/* Price */}
      <div className="flex items-center gap-2">
        <Line w="w-8" h="h-6" />
        <Line w="w-20" h="h-6" />
      </div>

      {/* Colors */}
      <div className="flex mt-4 gap-3">
        <Pill /><Pill /><Pill /><Pill />
      </div>

      {/* Sizes */}
      <div className="flex mt-4 gap-2 flex-wrap">
        <Chip /><Chip /><Chip />
      </div>

      {/* Add to cart */}
      <div className="mt-6">
        <div className="h-12 w-56 bg-gray-200 rounded" />
      </div>

      {/* Description */}
      <div className="space-y-2 pt-2">
        <Line />
        <Line w="w-11/12" />
        <Line w="w-10/12" />
        <Line w="w-9/12" />
      </div>
    </div>
  );
}