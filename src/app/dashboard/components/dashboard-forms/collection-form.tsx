import { Form } from "@/components/form";

export const CollectionForm = ({ method }: { method: "POST" | "PUT" }) => {
  const formTitle =
    method === "POST" ? "Create a new collection" : "Edit collection";
  const triggerText = method === "POST" ? "Create Collection" : "Save Changes";

  return (
    <Form formTitle={formTitle} triggerText={triggerText} method={method}>
      <label htmlFor="collectionName" className="text-sm font-medium">
        Collection Name
      </label>
      <input
        id="collectionName"
        type="text"
        placeholder="Enter collection name"
        className="input input-bordered w-full"
      />
    </Form>
  );
};
