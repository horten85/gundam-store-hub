import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { GradeBadge } from "@/components/GradeBadge";

interface Product {
  id: string;
  name: string;
  price: number;
  grade: string;
  link: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Check if already in cart
      const { data: existing } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from("cart").insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const filteredProducts = selectedGrade
    ? products.filter((p) => p.grade === selectedGrade)
    : products;

  const grades = ["HG", "MG", "SD", "PG", "RG"];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 glow-text">
            <span className="text-secondary">GUNDAM</span>{" "}
            <span className="text-primary">STORE</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Premium Mobile Suit Model Kits
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedGrade === null ? "default" : "outline"}
              onClick={() => setSelectedGrade(null)}
            >
              All Grades
            </Button>
            {grades.map((grade) => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? "default" : "outline"}
                onClick={() => setSelectedGrade(grade)}
                className={selectedGrade === grade ? `grade-${grade.toLowerCase()}` : ""}
              >
                {grade}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-display mb-4">NO PRODUCTS AVAILABLE YET</p>
              <p className="text-muted-foreground">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <GradeBadge grade={product.grade} />
                    <p className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => addToCart.mutate(product.id)}
                      disabled={addToCart.isPending}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    {product.link && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <a href={product.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;