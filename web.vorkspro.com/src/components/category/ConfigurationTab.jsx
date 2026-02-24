import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign } from "lucide-react";
import { apiGet, apiPatch } from "@/interceptor/interceptor";

export default function ConfigurationTab({ loading, onRefresh }) {
  const [exchangeRate, setExchangeRate] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const data = await apiGet('project/get-exchange-rate');
      if (data.isSuccess) {
        setExchangeRate(data.rate);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const data = await apiPatch('project/update-exchange-rate');
      if (data.isSuccess) {
        setExchangeRate(data.rate);
        setLastUpdated(data.lastUpdated);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error updating exchange rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-border rounded-lg">
            <div>
              <h3 className="font-medium text-[var(--foreground)]">USD to PKR Rate</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleString()}` : 'Live exchange rate'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--foreground)]">
                ₨{exchangeRate.toFixed(2)}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">per USD</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleRefresh}
              disabled={loading || isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || isLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}