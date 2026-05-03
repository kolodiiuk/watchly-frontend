import {useMemo} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {Card} from '../../components/ui/Card.tsx';
import {useGetTitleQuery} from '../api/catalogApi.ts';
import {TitleType} from '../models/TitleType.tsx';

export function TitlePage()
{
  const {titleId: titleIdParam} = useParams<{ titleId?: string }>();
  const titleId = Number(titleIdParam);
  const hasValidTitleId = Number.isInteger(titleId) && titleId > 0;

  const query = useGetTitleQuery(titleId, {skip: !hasValidTitleId});
  const targetPath = useMemo(() =>
  {
    if (!query.data)
    {
      return null;
    }

    return query.data.titleType === TitleType.Series ? `/series/${titleId}` : `/movie/${titleId}`;
  }, [query.data, titleId]);

  if (!hasValidTitleId)
  {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Title details</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">We could not load this title.</h1>
          </Card>
        </div>
      </main>
    );
  }

  if (query.isLoading || query.isFetching)
  {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised" className="animate-pulse h-72"/>
        </div>
      </main>
    );
  }

  if (query.isError || !targetPath)
  {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Title details</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">This title is unavailable right now.</h1>
          </Card>
        </div>
      </main>
    );
  }

  return <Navigate to={targetPath} replace/>;
}
