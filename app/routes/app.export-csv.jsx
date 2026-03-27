import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const rows = await prisma.quoteRequest.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });
  const header = "Name,Email,Company,Product ID,Message,Date\n";
  const csv = rows.map((r) =>
    [r.customerName, r.customerEmail, r.company || "", r.productId, (r.message || "").replace(/"/g, '""'), r.createdAt.toISOString()]
      .map((v) => `"${v}"`)
      .join(",")
  ).join("\n");
  return new Response(header + csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="quote-requests.csv"',
    },
  });
};
