import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="text-center bg-red-500 dark:bg-red-700 text-white py-6">
            <div className="text-5xl mb-2">❌</div>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Oops! Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-8 text-center">
            {params?.error ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Code error: <span className="font-mono">{params.error}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                An unspecified error occurred.
              </p>
            )}
            <Link href="/">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-300">
                Go Back Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
