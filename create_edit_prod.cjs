const fs = require('fs');

let code = fs.readFileSync('src/app/client/manage/products/create/page.tsx', 'utf8');

// 1. Add useEffect to fetch data if id is present
code = code.replace(
  'const router = useRouter();',
  'const router = useRouter();\n  const { id } = React.use(params as any) as any;\n'
);

code = code.replace(
  'export default function CreateProduct() {',
  'export default function EditProduct({ params }: { params: any }) {'
);

code = code.replace(
  'const [isSubmitting, setIsSubmitting] = useState(false);',
  `const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch(\`/api/products/\${id}\`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProductDetails({
            name: data.name || '',
            category: data.category || '',
            subCategory: data.subCategory || '',
            uom: data.uom || '',
            description: data.description || '',
            terms: data.terms || '',
            articleCode: data.articleCode || '',
            hsnCode: data.hsnCode || '',
            imageUrl: data.imageUrl || '',
            phone: data.phone || ''
          });
        }
        setIsLoading(false);
      });
  }, [id]);`
);

// 2. Change POST to PUT
code = code.replace(
  'const res = await fetch(\'/api/products\', {',
  'const res = await fetch(`/api/products/${id}`, {'
);
code = code.replace(
  'method: \'POST\',',
  'method: \'PUT\','
);

// 3. Change titles
code = code.replace(
  '<h1>Create New Product</h1>',
  '<h1>Edit Product</h1>'
);
code = code.replace(
  'Save Product',
  'Update Product'
);

// 4. Handle early return for loading
code = code.replace(
  'return (',
  'if (isLoading) return <div style={{ padding: "40px" }}>Loading...</div>;\n\n  return ('
);

fs.writeFileSync('src/app/client/manage/products/edit/[id]/page.tsx', code, 'utf8');
console.log("Edit product page created");
