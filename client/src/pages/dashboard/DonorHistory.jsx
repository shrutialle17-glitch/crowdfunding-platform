import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Download, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DonorHistory = () => {
  const { data: donations, isLoading } = useQuery({
    queryKey: ['donor-history'],
    queryFn: async () => {
      const res = await api.get('/users/me/donations');
      return res.data.data;
    }
  });

  const handleDownloadReceipt = async (donationId, receiptId) => {
    try {
      const response = await api.get(`/donations/${donationId}/receipt`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptId || donationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download receipt', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleExportCSV = () => {
    if (!donations || donations.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Receipt ID,Campaign Title,Date,Amount,Status\n";

    donations.forEach(donation => {
      const receiptId = donation.receiptId || donation._id;
      const title = `"${donation.campaign?.title?.replace(/"/g, '""') || 'Unknown'}"`;
      const date = new Date(donation.createdAt).toLocaleDateString();
      const amount = donation.amount;
      const status = donation.status;

      csvContent += `${receiptId},${title},${date},${amount},${status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_donation_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'failed': return <Badge variant="highlight">Failed</Badge>;
      case 'refunded': return <Badge variant="outline">Refunded</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="donor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-h2">Donation History</h2>
            <p className="text-body text-text-secondary mt-1">Review all your past contributions and download receipts.</p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0" onClick={handleExportCSV} disabled={!donations || donations.length === 0 || isLoading}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <Card className="overflow-hidden border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-background/50 border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-10 bg-border/50 animate-pulse rounded-lg w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-border/50 animate-pulse rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-border/50 animate-pulse rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-border/50 animate-pulse rounded-full w-20"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-border/50 animate-pulse rounded-lg w-24 ml-auto"></div></td>
                    </tr>
                  ))
                ) : donations?.length > 0 ? (
                  donations.map(donation => (
                    <tr key={donation._id} className="transition-colors hover:bg-background/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center overflow-hidden shrink-0">
                            {donation.campaign?.coverImage?.url ? (
                              <img src={donation.campaign.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                              <Target className="w-5 h-5 text-text-secondary" />
                            )}
                          </div>
                          <div>
                            <Link to={`/campaigns/${donation.campaign?._id}`} className="font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1">
                              {donation.campaign?.title || 'Unknown Campaign'}
                            </Link>
                            <div className="text-xs text-text-secondary">Receipt ID: {donation.receiptId || donation._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(donation.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                        ₹{donation.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(donation.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          className="text-xs py-1.5 px-3 gap-1"
                          onClick={() => handleDownloadReceipt(donation._id, donation.receiptId)}
                          disabled={donation.status !== 'completed'}
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-text-secondary">
                      <Target className="w-12 h-12 text-border mx-auto mb-4" />
                      <p className="text-lg font-medium text-text-primary">No donations found.</p>
                      <p className="mt-1 mb-4">You haven't made any contributions yet.</p>
                      <Link to="/explore"><Button>Explore Campaigns</Button></Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
