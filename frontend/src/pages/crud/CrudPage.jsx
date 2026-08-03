import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/card/Card";
import DataTable from "../../components/dataTable/DataTable";
import Modal from "../../components/modal/Modal";
import DynamicForm from "../../components/form/DynamicForm";
import ConfirmationModal from "../../components/confirmationModal/ConfirmationModal";
import DetailList from "../../components/layout/DetailList";
import Button from "../../components/button/Button";
import useCrud from "../../hooks/useCrud";
import ROUTES from "../../constants/routes";
import { toFormDefaults } from "../../utils/helpers";

/**
 * ONE page component that every CRUD module reuses.
 *
 * A module supplies a config object (see pages/<module>/<module>Config.js) and
 * this component provides: list + search + sort + pagination + create + edit +
 * view + delete + confirmation + toasts + loading states.
 *
 * If a module ever needs something bespoke, it can still render its own page —
 * nothing here is mandatory.
 */
const CrudPage = ({ config }) => {
  const {
    title,
    singular,
    description,
    service,
    columns,
    searchFields = [],
    schema,
    buildFields,
    fields: staticFields,
    lookups: lookupServices,
    detailItems,
    toPayload,
    canCreate = true,
    canEdit = true,
    canDelete = true,
    initialSortKey = "id",
    initialSortDir = "desc",
    emptyMessage,
    notice,
  } = config;

  const crud = useCrud(service, singular);

  // Some forms need dropdowns filled from another endpoint (e.g. a package
  // picker on Package items). Those endpoints are declared in `lookups`.
  const [lookups, setLookups] = useState({});

  useEffect(() => {
    if (!lookupServices) return;

    let isActive = true;
    const names = Object.keys(lookupServices);

    Promise.allSettled(
      names.map((name) => lookupServices[name].getAll(undefined, { skipErrorToast: true }))
    ).then((results) => {
      if (!isActive) return;
      const next = {};
      results.forEach((outcome, index) => {
        next[names[index]] =
          outcome.status === "fulfilled" && Array.isArray(outcome.value) ? outcome.value : [];
      });
      setLookups(next);
    });

    return () => {
      isActive = false;
    };
  }, [lookupServices]);

  const formFields = useMemo(
    () => (buildFields ? buildFields(lookups) : staticFields || []),
    [buildFields, staticFields, lookups]
  );

  const isFormOpen = crud.mode === "create" || crud.mode === "edit";
  const isViewOpen = crud.mode === "view";

  const defaultValues = useMemo(
    () => toFormDefaults(crud.mode === "edit" ? crud.activeRow : null, formFields),
    [crud.mode, crud.activeRow, formFields]
  );

  const handleSubmit = async (values) => {
    const payload = toPayload ? toPayload(values, crud.activeRow) : values;
    await crud.saveRow(payload);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: title }]}
        actions={
          <>
            <Button variant="secondary" onClick={crud.reload} disabled={crud.isLoading}>
              Refresh
            </Button>
            {canCreate && (
              <Button variant="primary" onClick={crud.openCreate}>
                New {singular.toLowerCase()}
              </Button>
            )}
          </>
        }
      />

      {notice && <p className="notice u-mb-4">{notice}</p>}

      <Card flush>
        <DataTable
          columns={columns}
          rows={crud.rows}
          isLoading={crud.isLoading}
          error={crud.error}
          onRetry={crud.reload}
          searchFields={searchFields}
          searchPlaceholder={`Search ${title.toLowerCase()}`}
          initialSortKey={initialSortKey}
          initialSortDir={initialSortDir}
          emptyTitle={`No ${title.toLowerCase()} yet`}
          emptyMessage={
            emptyMessage || `Create the first ${singular.toLowerCase()} to get started.`
          }
          emptyActionLabel={canCreate ? `New ${singular.toLowerCase()}` : undefined}
          onEmptyAction={canCreate ? crud.openCreate : undefined}
          onView={detailItems ? crud.openView : undefined}
          onEdit={canEdit ? crud.openEdit : undefined}
          onDelete={canDelete ? crud.askDelete : undefined}
        />
      </Card>

      {/* Create / Edit */}
      <Modal
        isOpen={isFormOpen}
        onClose={crud.closeModal}
        size="lg"
        title={crud.mode === "edit" ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        subtitle={
          crud.mode === "edit"
            ? `Record #${crud.activeRow?.id}`
            : `Add a ${singular.toLowerCase()} to the system.`
        }
      >
        <DynamicForm
          fields={formFields}
          schema={schema}
          defaultValues={defaultValues}
          isSubmitting={crud.isSaving}
          submitLabel={crud.mode === "edit" ? "Save changes" : `Create ${singular.toLowerCase()}`}
          onSubmit={handleSubmit}
          onCancel={crud.closeModal}
        />
      </Modal>

      {/* View */}
      <Modal
        isOpen={isViewOpen}
        onClose={crud.closeModal}
        size="lg"
        title={`${singular} details`}
        subtitle={`Record #${crud.activeRow?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={crud.closeModal}>
              Close
            </Button>
            {canEdit && crud.activeRow && (
              <Button variant="primary" onClick={() => crud.openEdit(crud.activeRow)}>
                Edit {singular.toLowerCase()}
              </Button>
            )}
          </>
        }
      >
        {crud.activeRow && detailItems && (
          <DetailList items={detailItems(crud.activeRow, lookups)} />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={Boolean(crud.rowToDelete)}
        title={`Delete this ${singular.toLowerCase()}?`}
        message={`Record #${crud.rowToDelete?.id} will be removed from the database. This can't be undone.`}
        confirmLabel={`Delete ${singular.toLowerCase()}`}
        isLoading={crud.isDeleting}
        onConfirm={crud.confirmDelete}
        onCancel={crud.cancelDelete}
      />
    </>
  );
};

export default CrudPage;
