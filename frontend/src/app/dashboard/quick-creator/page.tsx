import { redirect } from 'next/navigation';

export default function QuickCreatorPage() {
  redirect('/dashboard');
  return null;
}
