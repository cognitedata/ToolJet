import React, { useState, useEffect } from 'react';
import Modal from '@/HomePage/Modal';
import { useTranslation } from 'react-i18next';
import { organizationService } from '@/_services';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/_helpers/appUtils';
import SolidIcon from '@/_ui/Icon/SolidIcons';
import { ButtonSolid } from '@/_ui/AppButton/AppButton';
import WorkspaceSSOEnableModal from './WorkspaceSSOEnableModal';

export function AzureSSOModal({ settings, onClose, onUpdateSSOSettings, isInstanceOptionEnabled }) {
  const [showModal, setShowModal] = useState(false);
  const [ssoSettings, setSettings] = useState(settings);
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [isSaving, setSaving] = useState(false);
  const [configId, setConfigId] = useState(settings?.id);
  const [clientId, setClientId] = useState(settings?.configs?.client_id || '');
  const [tenantId, setTenantId] = useState(settings?.configs?.tenant_id || '');
  const [enableCdfAccess, setEnableCdfAccess] = useState(settings?.configs?.enable_cdf_access || false);
  const [cdfCluster, setCdfCluster] = useState(settings?.configs?.cdf_cluster || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showEnablingWorkspaceSSOModal, setShowEnablingWorkspaceSSOModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setSettings(settings);
    setEnabled(settings?.enabled || false);
    setClientId(settings?.configs?.client_id || '');
    setTenantId(settings?.configs?.tenant_id || '');
    setEnableCdfAccess(settings?.configs?.enable_cdf_access || false);
    setCdfCluster(settings?.configs?.cdf_cluster || '');
    setShowModal(true);
  }, [settings]);

  useEffect(() => {
    checkChanges();
  }, [tenantId, clientId, enabled, enableCdfAccess, cdfCluster]);

  const handleClientIdChange = (newClientId) => {
    setClientId(newClientId);
    checkChanges();
  };

  const handleTenantIdChange = (newTenantId) => {
    setTenantId(newTenantId);
    checkChanges();
  };

  const handleEnableCdfAccessChange = () => {
    setEnableCdfAccess(!enableCdfAccess);
    checkChanges();
  };

  const handleCdfClusterChange = (newCdfCluster) => {
    setCdfCluster(newCdfCluster);
    checkChanges();
  };

  const onToggleChange = () => {
    const newEnabledStatus = !enabled;
    setEnabled(newEnabledStatus);
    checkChanges();
  };

  const checkChanges = () => {
    const hasClientIdChanged = clientId !== (settings?.configs?.client_id || '');
    const hasTenantIdChanged = tenantId !== (settings?.configs?.tenant_id || '');
    const hasEnableCdfAccessChanged = enableCdfAccess !== (settings?.configs?.enable_cdf_access || false);
    const hasCdfClusterChanged = cdfCluster !== (settings?.configs?.cdf_cluster || '');
    const hasEnabledChanged = enabled !== (settings?.enabled || false);
    setHasChanges(
      hasClientIdChanged || hasTenantIdChanged || hasEnableCdfAccessChanged || hasCdfClusterChanged || hasEnabledChanged
    );
  };

  const reset = () => {
    setClientId(settings?.configs?.client_id || '');
    setTenantId(settings?.configs?.tenant_id || '');
    setEnableCdfAccess(settings?.configs?.enable_cdf_access || false);
    setCdfCluster(settings?.configs?.cdf_cluster || '');
    setEnabled(settings?.enabled || false);
    setHasChanges(false);
  };

  const copyFunction = (input) => {
    let text = document.getElementById(input).innerHTML;
    copyToClipboard(text);
  };

  const saveSettings = () => {
    setSaving(true);
    organizationService
      .editOrganizationConfigs({
        type: 'cdf_azure',
        configs: {
          client_id: clientId,
          tenant_id: tenantId,
          enable_cdf_access: enableCdfAccess,
          cdf_cluster: cdfCluster,
        },
        enabled: enabled,
      })
      .then(
        (data) => {
          setSaving(false);
          data.id && setConfigId(data.id);
          onUpdateSSOSettings('cdf_azure', {
            id: data?.id || configId,
            configs: {
              client_id: clientId,
              tenant_id: tenantId,
              enable_cdf_access: enableCdfAccess,
              cdf_cluster: cdfCluster,
            },
            enabled: enabled,
          });
          setSettings({
            id: data?.id || configId,
            configs: {
              client_id: clientId,
              tenant_id: tenantId,
              enable_cdf_access: enableCdfAccess,
              cdf_cluster: cdfCluster,
            },
            enabled: enabled,
          });
          toast.success('Saved Microsoft SSO configurations', {
            position: 'top-center',
          });
        },
        () => {
          setSaving(false);
          toast.error('Error while saving Microsoft SSO configurations', {
            position: 'top-center',
          });
        }
      );
    setHasChanges(false);
  };

  const initiateSave = () => {
    if (enabled != settings?.enabled && enabled === true && isInstanceOptionEnabled('cdf_azure')) {
      setShowEnablingWorkspaceSSOModal(true);
    } else {
      saveSettings();
    }
  };

  // AzureHeader Component
  function AzureHeader() {
    const { t } = useTranslation();
    return (
      <div
        className="d-flex justify-content-between title-with-toggle"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: '0px',
          height: '42px',
        }}
      >
        <div>
          <label className="switch" data-cy="azure-enable-toggle">
            <input type="checkbox" checked={enabled} onChange={onToggleChange} />
            <span className="slider round"></span>
          </label>
          <span className="sso-type-header" data-cy="card-title" style={{ marginBottom: '0px', fontWeight: '500' }}>
            {t('header.organization.menus.manageSSO.cdf_azure.title', 'Microsoft')}
          </span>
        </div>
        <div className="card-title" style={{ marginBottom: '0px' }}>
          <span className={`tj-text-xsm ${enabled ? 'enabled-tag' : 'disabled-tag'}`} data-cy="status-label">
            {enabled
              ? t('header.organization.menus.manageSSO.cdf_azure.enabled', 'Enabled')
              : t('header.organization.menus.manageSSO.cdf_azure.disabled', 'Disabled')}
          </span>
        </div>
      </div>
    );
  }

  // AzureFooter Component
  function AzureFooter() {
    const { t } = useTranslation();
    return (
      <div className="form-footer sso-card-footer" style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
        <ButtonSolid onClick={onClose} data-cy="cancel-button" variant="tertiary" className="sso-footer-cancel-btn">
          {t('globals.cancel', 'Cancel')}
        </ButtonSolid>
        <ButtonSolid
          disabled={!hasChanges || isSaving}
          isLoading={isSaving}
          onClick={initiateSave}
          data-cy="save-button"
          variant="primary"
          className="sso-footer-save-btn"
          leftIcon="floppydisk"
          fill="#fff"
          iconWidth="20"
        >
          {t('globals.savechanges', 'Save changes')}
        </ButtonSolid>
      </div>
    );
  }

  const renderModalTitle = () => {
    return <AzureHeader />;
  };

  const renderFooterContent = () => {
    return <AzureFooter />;
  };

  return (
    <div>
      {showModal && (
        <Modal
          show={showModal}
          closeModal={onClose}
          title={renderModalTitle()}
          footerContent={renderFooterContent()}
          customClassName="modal-custom-height"
          size="lg"
          closeButton={false}
        >
          {showEnablingWorkspaceSSOModal && <div className="overlay-style"></div>}
          <div className="sso-card-wrapper">
            <div className="card-body">
              <form noValidate className="sso-form-wrap">
                <div className="form-group mb-3">
                  <label className="form-label" data-cy="client-id-label">
                    {'Client ID'}
                  </label>
                  <div className="tj-app-input">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={'Enter Client ID'}
                      value={clientId}
                      onChange={(e) => handleClientIdChange(e.target.value)}
                      data-cy="client-id-input"
                    />
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label" data-cy="tenant-id-label">
                    {'Tenant ID'}
                  </label>
                  <div className="tj-app-input">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={'Enter Tenant ID'}
                      value={tenantId}
                      onChange={(e) => handleTenantIdChange(e.target.value)}
                      data-cy="tenant-id-input"
                    />
                  </div>
                </div>
                {configId && (
                  <div className="form-group mb-3">
                    <label className="form-label" data-cy="redirect-url-label">
                      {t('header.organization.menus.manageSSO.cdf_azure.redirectUrl', 'Redirect URL')}
                    </label>
                    <div className="d-flex justify-content-between form-control align-items-center">
                      {`${window.public_config?.TOOLJET_HOST}${
                        window.public_config?.SUB_PATH ? window.public_config?.SUB_PATH : '/'
                      }sso/cdf_azure/${configId}`}
                      <SolidIcon name="copy" width="16" onClick={() => copyFunction('redirect-url')} />
                    </div>
                  </div>
                )}
                <div className="form-group mb-3">
                  <div
                    className="d-flex justify-content-between"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      marginBottom: '0px',
                      height: '42px',
                    }}
                  >
                    <div>
                      <label className="switch" data-cy="azure-enable-cdf-access-toggle">
                        <input type="checkbox" checked={enableCdfAccess} onChange={handleEnableCdfAccessChange} />
                        <span className="slider round"></span>
                      </label>
                      <span
                        className="sso-type-header"
                        data-cy="card-title"
                        style={{ marginBottom: '0px', fontWeight: '500' }}
                      >
                        {t('header.organization.menus.manageSSO.cdf_azure.enable_cdf_access', 'Allow access to CDF')}
                      </span>

                      <div className="help-text danger-text-login">
                        <div data-cy="enable-sign-up-helper-text">
                          Enables user impersonation and requests a token that allows accessing data in CDF
                        </div>
                      </div>
                    </div>
                    <div className="card-title" style={{ marginBottom: '0px' }}>
                      <span
                        className={`tj-text-xsm ${enableCdfAccess ? 'enabled-tag' : 'disabled-tag'}`}
                        data-cy="status-label"
                      >
                        {enableCdfAccess
                          ? t('header.organization.menus.manageSSO.cdf_azure.enabled_cdf_access', 'Enabled')
                          : t('header.organization.menus.manageSSO.cdf_azure.disabled_cdf_access', 'Disabled')}
                      </span>
                    </div>
                  </div>
                  {enableCdfAccess && (
                    <div className="form-group mt-3">
                      <label className="form-label" data-cy="redirect-url-label">
                        {t('header.organization.menus.manageSSO.cdf_azure.cdf_cluster', 'CDF Cluster')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={'Enter CDF Cluster'}
                        value={cdfCluster}
                        onChange={(e) => handleCdfClusterChange(e.target.value)}
                        data-cy="cdf-cluster-input"
                      />

                      <div className="mt-1 tj-text-xxsm">
                        <div data-cy="workspace-login-help-text">
                          {t('header.organization.menus.manageSSO.cdf_azure.cdf_cluster', `For example: westeurope-1`)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          {showEnablingWorkspaceSSOModal && (
            <WorkspaceSSOEnableModal
              show={showEnablingWorkspaceSSOModal}
              ssoKey={'cdf_azure'}
              saveSettings={saveSettings}
              setShowModal={setShowEnablingWorkspaceSSOModal}
              reset={reset}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
