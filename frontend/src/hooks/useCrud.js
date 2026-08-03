import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * All the state a CRUD page needs, in one place:
 * loading the list, opening the create/edit/view modal, saving, deleting.
 *
 * Pages don't call the service directly — they pass it in here so every
 * module behaves identically.
 *
 * @param {object} service   must expose getAll, create, update, remove
 * @param {string} label     singular noun used in toasts, e.g. "Product"
 */
const useCrud = (service, label = "Record") => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // "create" | "edit" | "view" | null
  const [mode, setMode] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [rowToDelete, setRowToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (caught) {
      setError(caught?.message || "Couldn't load this list.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const openCreate = () => {
    setActiveRow(null);
    setMode("create");
  };

  const openEdit = (row) => {
    setActiveRow(row);
    setMode("edit");
  };

  const openView = (row) => {
    setActiveRow(row);
    setMode("view");
  };

  const closeModal = () => {
    setMode(null);
    setActiveRow(null);
  };

  /** Create or update, depending on which modal is open. */
  const saveRow = async (values) => {
    setIsSaving(true);
    try {
      if (mode === "edit" && activeRow) {
        await service.update(activeRow.id, values);
        toast.success(`${label} updated.`);
      } else {
        await service.create(values);
        toast.success(`${label} created.`);
      }
      closeModal();
      await loadRows();
      return true;
    } catch (caught) {
      // The interceptor already showed the error toast; keep the modal open
      // so the operator can fix the input.
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const askDelete = (row) => setRowToDelete(row);
  const cancelDelete = () => setRowToDelete(null);

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    setIsDeleting(true);
    try {
      await service.remove(rowToDelete.id);
      toast.success(`${label} deleted.`);
      setRowToDelete(null);
      await loadRows();
    } catch (caught) {
      // Toast already shown by the interceptor.
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    rows,
    isLoading,
    error,
    reload: loadRows,

    mode,
    activeRow,
    isSaving,
    openCreate,
    openEdit,
    openView,
    closeModal,
    saveRow,

    rowToDelete,
    isDeleting,
    askDelete,
    cancelDelete,
    confirmDelete,
  };
};

export default useCrud;
