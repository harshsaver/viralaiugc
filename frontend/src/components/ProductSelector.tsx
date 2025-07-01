import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

interface Product {
  id: number;
  app_name: string;
  short_description: string;
  long_description: string | null;
  target_audience: string | null;
  example_hooks: string | null;
  example_hashtags: string | null;
}

interface ProductSelectorProps {
  selectedProductId: number | null;
  onSelectProduct: (product: Product | null) => void;
}

const ProductSelector = ({ selectedProductId, onSelectProduct }: ProductSelectorProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    if (value === "none") {
      onSelectProduct(null);
    } else {
      const product = products.find(p => p.id.toString() === value);
      if (product) {
        onSelectProduct(product);
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="text-sm font-medium mb-2 block">
        Select Product
      </label>
      <Select
        value={selectedProductId?.toString() || "none"}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a product">
            {selectedProductId ? (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {products.find(p => p.id === selectedProductId)?.app_name || "Select a product"}
              </div>
            ) : (
              <span className="text-muted-foreground">Select a product for AI hooks</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">None</span>
          </SelectItem>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id.toString()}>
              <div className="flex flex-col">
                <span className="font-medium">{product.app_name}</span>
                <span className="text-xs text-muted-foreground">{product.short_description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSelector; 