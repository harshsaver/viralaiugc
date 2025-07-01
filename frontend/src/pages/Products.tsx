import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Package, X, Hash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: number;
  app_name: string;
  short_description: string;
  long_description: string | null;
  target_audience: string | null;
  example_hooks: string | null;
  example_hashtags: string | null;
  created_at: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [appName, setAppName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [exampleHooks, setExampleHooks] = useState<string[]>([]);
  const [currentHook, setCurrentHook] = useState("");
  const [exampleHashtags, setExampleHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState("");

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
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHook = () => {
    if (currentHook.trim()) {
      setExampleHooks([...exampleHooks, currentHook.trim()]);
      setCurrentHook("");
    }
  };

  const handleRemoveHook = (index: number) => {
    setExampleHooks(exampleHooks.filter((_, i) => i !== index));
  };

  const handleAddHashtag = () => {
    const hashtag = currentHashtag.trim();
    if (hashtag) {
      // Ensure hashtag starts with #
      const formattedHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
      if (!exampleHashtags.includes(formattedHashtag)) {
        setExampleHashtags([...exampleHashtags, formattedHashtag]);
      }
      setCurrentHashtag("");
    }
  };

  const handleRemoveHashtag = (index: number) => {
    setExampleHashtags(exampleHashtags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: any, action: 'hook' | 'hashtag') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'hook') {
        handleAddHook();
      } else {
        handleAddHashtag();
      }
    }
  };

  const handleSubmit = async () => {
    if (!appName || !shortDescription) {
      toast.error('App name and short description are required');
      return;
    }

    try {
      const productData = {
        app_name: appName,
        short_description: shortDescription,
        long_description: longDescription || null,
        target_audience: targetAudience || null,
        example_hooks: exampleHooks.length > 0 ? JSON.stringify(exampleHooks) : null,
        example_hashtags: exampleHashtags.length > 0 ? JSON.stringify(exampleHashtags) : null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product added successfully');
      }

      resetForm();
      setDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setAppName(product.app_name);
    setShortDescription(product.short_description);
    setLongDescription(product.long_description || "");
    setTargetAudience(product.target_audience || "");
    setExampleHooks(product.example_hooks ? JSON.parse(product.example_hooks) : []);
    setExampleHashtags(product.example_hashtags ? JSON.parse(product.example_hashtags) : []);
    setCurrentHook("");
    setCurrentHashtag("");
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setAppName("");
    setShortDescription("");
    setLongDescription("");
    setTargetAudience("");
    setExampleHooks([]);
    setCurrentHook("");
    setExampleHashtags([]);
    setCurrentHashtag("");
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No products yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first product to start generating AI-powered hooks
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{product.app_name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {product.short_description}
              </p>
              {product.target_audience && (
                <div className="mb-2">
                  <span className="text-xs font-medium">Target Audience:</span>
                  <p className="text-xs text-muted-foreground">{product.target_audience}</p>
                </div>
              )}
              {product.example_hooks && (
                <div className="mb-2">
                  <span className="text-xs font-medium">Example Hooks:</span>
                  <p className="text-xs text-muted-foreground">
                    {JSON.parse(product.example_hooks).length} hooks
                  </p>
                </div>
              )}
              {product.example_hashtags && (
                <div>
                  <span className="text-xs font-medium">Hashtags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {JSON.parse(product.example_hashtags).slice(0, 3).map((tag: string, idx: number) => (
                      <span key={idx} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {JSON.parse(product.example_hashtags).length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{JSON.parse(product.example_hashtags).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              Enter your product details to generate AI-powered hooks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="appName">App Name *</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g., MyFitnessApp"
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g., AI-powered fitness tracking app"
              />
            </div>

            <div>
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Detailed description of your product..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Health-conscious millennials"
              />
            </div>

            <div>
              <Label>Example Hooks Used by Competitors</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentHook}
                  onChange={(e) => setCurrentHook(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'hook')}
                  placeholder="Enter a hook and press Enter"
                />
                <Button type="button" onClick={handleAddHook} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {exampleHooks.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {exampleHooks.map((hook, index) => (
                    <div key={index} className="flex items-start justify-between gap-2 p-2 bg-secondary/50 rounded">
                      <span className="text-sm flex-1">{hook}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHook(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Example Hashtags Used by Competitors</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'hashtag')}
                  placeholder="Enter a hashtag and press Enter"
                />
                <Button type="button" onClick={handleAddHashtag} size="sm">
                  <Hash className="h-4 w-4" />
                </Button>
              </div>
              {exampleHashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exampleHashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {hashtag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveHashtag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products; 