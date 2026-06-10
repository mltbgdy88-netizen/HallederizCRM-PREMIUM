import { ShowroomCanvas } from '../components/showroom/ShowroomCanvas';
import { TopOverlay } from '../components/ui/TopOverlay';
import { ProductPanel } from '../components/ui/ProductPanel';

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#171412] text-[#f4eee4]">
      <ShowroomCanvas />
      <TopOverlay />
      <ProductPanel />
    </main>
  );
}
