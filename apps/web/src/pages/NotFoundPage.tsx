import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
export function NotFoundPage() {
  return <div className="py-16"><EmptyState icon={<Compass size={24} />} title="Page not found" description="That page wandered off. Let’s get you back to the dictionary." action={<Link to="/" className="btn-primary">Back home</Link>} /></div>;
}
