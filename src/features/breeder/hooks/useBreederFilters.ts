import { useSearchParams } from 'react-router-dom';
import { readBreederFilters, updateBreederFilters } from '../model/breederFilters';

export function useBreederFilters() {
  const [params, setParams] = useSearchParams();
  const filters = readBreederFilters(params);
  const update = (changes: Record<string, string | number | undefined>) =>
    setParams((previous) => updateBreederFilters(previous, changes));
  return { ...filters, update };
}
