import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Zap } from "lucide-react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { PageSurface, EmptyState, LoadingGrid } from "@/components/saas/SaaSPrimitives";

const CollectionDetail = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const { data } = await api.get(`/collections/${slug}`);
        setCollection(data.collection || data);
      } catch (err) {
        setError("Failed to load collection details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollection();
  }, [slug]);

  if (isLoading) return <PageSurface><LoadingGrid cards={1} /></PageSurface>;
  if (error || !collection) return <PageSurface><EmptyState title="Collection Not Found" description={error || "This collection might have been removed."} action={<Link to="/collections"><Button>Back to Collections</Button></Link>} /></PageSurface>;

  return (
    <PageSurface>
      <Link to="/collections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collections
      </Link>
      
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden mb-8" style={{ background: collection.imageColor || "#2e1e3e" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
        <div className="relative p-8 md:p-12 lg:p-16 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-primary/20 p-4 border border-primary/30 text-primary">
            <Bookmark className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">{collection.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{collection.description || "A curated collection of specialized workouts."}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Collection Workouts</h2>
        {collection.workouts && collection.workouts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collection.workouts.map((workout, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground">{workout.title || `Workout ${idx + 1}`}</h3>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{workout.type || "Training"}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No workouts found" description="This collection doesn't have any workouts yet." />
        )}
      </div>
    </PageSurface>
  );
};

export default CollectionDetail;
