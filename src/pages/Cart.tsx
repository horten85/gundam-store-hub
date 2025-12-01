import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, ShoppingBag } from "lucide-react";
import { GradeBadge } from "@/components/GradeBadge";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    grade: string;
  };
}

const Cart = () => {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cart")
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            grade
          )
        `)
        .eq("user_id", user.id);
      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase.from("cart").delete().eq("id", cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
  });

  const checkout = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      // Delete all cart items and the associated products
      const productIds = cartItems.map((item) => item.products.id);
      
      // First delete cart items
      const { error: cartError } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", user.id);
      if (cartError) throw cartError;

      // Then delete products (only admins can do this, but checkout simulates purchase)
      const { error: productError } = await supabase
        .from("products")
        .delete()
        .in("id", productIds);
      if (productError) throw productError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order placed! Products have been purchased.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Checkout failed");
    },
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-display flex items-center gap-2">
              <ShoppingBag className="w-8 h-8" />
              Shopping Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading cart...</p>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
                <Button asChild>
                  <a href="/">Browse Products</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.products.name}</h3>
                      <GradeBadge grade={item.products.grade} />
                      <p className="text-muted-foreground mt-2">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="text-2xl font-bold text-primary">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart.mutate(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-display">Total</p>
                    <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => checkout.mutate()}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? "Processing..." : "Complete Purchase"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Products will be removed from inventory after purchase
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cart;