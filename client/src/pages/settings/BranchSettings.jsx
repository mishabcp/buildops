import { useState, useEffect } from 'react';
import { authStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { getBranches, updateBranch } from '../../api/branches.api.js';

export function BranchSettings() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    if (isSuperAdmin) load();
    else setLoading(false);
  }, [isSuperAdmin]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getBranches();
      if (res?.success && res?.data) setBranches(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(branch) {
    setEditingId(branch.id);
    setEditName(branch.name);
    setEditLocation(branch.location ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditLocation('');
  }

  async function saveEdit() {
    if (editingId == null) return;
    setError('');
    try {
      const res = await updateBranch(editingId, { name: editName.trim(), location: editLocation.trim() || null });
      if (res?.success && res?.data) {
        setBranches((prev) => prev.map((b) => (b.id === editingId ? res.data : b)));
        cancelEdit();
      } else {
        setError(res?.error ?? 'Failed to update');
      }
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to update');
    }
  }

  if (!isSuperAdmin) return <p className="text-gray-500">You need Super Admin access to manage branches.</p>;
  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branches.length === 0 ? (
              <p className="text-gray-500">No branches.</p>
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  {editingId === branch.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        className="max-w-xs"
                      />
                      <Input
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Location"
                        className="max-w-xs"
                      />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium">{branch.name}</span>
                        {branch.location && <span className="ml-2 text-gray-500">— {branch.location}</span>}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => startEdit(branch)}>Edit</Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
