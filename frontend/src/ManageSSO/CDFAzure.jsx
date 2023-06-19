import React, { useState } from 'react';
import { organizationService } from '@/_services';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/_helpers/appUtils';
import { useTranslation } from 'react-i18next';
import SolidIcon from '@/_ui/Icon/SolidIcons';
import { ButtonSolid } from '@/_ui/AppButton/AppButton';
import Toggle from '@/_ui/Toggle/index';

export function CDFAzure({ settings, updateData }) {
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [clientId, setClientId] = useState(settings?.configs?.client_id || '');
  const [clientSecret, setClientSecret] = useState(settings?.configs?.client_secret || '');
  const [cdfBaseUrl, setCdfBaseUrl] = useState(settings?.configs?.cdf_base_url || '');
  const [tenantId, setTenantId] = useState(settings?.configs?.tenant_id || '');
  const [isSaving, setSaving] = useState(false);
  const [configId, setConfigId] = useState(settings?.id);
  const { t } = useTranslation();

  const reset = () => {
    setClientId(settings?.configs?.clientId || '');
    setClientSecret(settings?.configs?.clientSecret || '');
    setTenantId(settings?.configs?.tenantId || '');
    setCdfBaseUrl(settings?.configs?.cdfBaseUrl || 'https://api.cognitedata.com');
  };

  const copyFunction = (input) => {
    let text = document.getElementById(input).innerHTML;
    copyToClipboard(text);
  };

  const saveSettings = () => {
    setSaving(true);
    console.log(clientId, clientSecret, tenantId, cdfBaseUrl);
    organizationService
      .editOrganizationConfigs({
        type: 'cdf_azure',
        configs: { clientId, clientSecret, tenantId, cdfBaseUrl },
      })
      .then(
        (data) => {
          setSaving(false);
          data.id && setConfigId(data.id);
          updateData('cdf_azure', {
            id: data.id,
            configs: {
              clientId: clientId,
              tenantId: tenantId,
              clientSecret: clientSecret,
              cdfBaseUr: cdfBaseUrl,
            },
          });
          toast.success('updated CDF Azure configurations', {
            position: 'top-center',
          });
        },
        () => {
          setSaving(false);
          toast.error('Error while saving CDF Azure configurations', {
            position: 'top-center',
          });
        }
      );
  };

  const changeStatus = () => {
    setSaving(true);
    organizationService.editOrganizationConfigs({ type: 'cdf_azure', enabled: !enabled }).then(
      (data) => {
        setSaving(false);
        const enabled_tmp = !enabled;
        setEnabled(enabled_tmp);
        data.id && setConfigId(data.id);
        updateData('cdf_azure', { id: data.id, enabled: enabled_tmp });
        toast.success(`${enabled_tmp ? 'Enabled' : 'Disabled'} CDF Azure`, {
          position: 'top-center',
        });
      },
      () => {
        setSaving(false);
        toast.error('Error while saving CDF Azure configurations', {
          position: 'top-center',
        });
      }
    );
  };

  console.log(settings);
  console.log(clientSecret);

  return (
    <div className="sso-card-wrapper">
      <div className="card-header">
        <div className="d-flex justify-content-between title-with-toggle">
          <div>
            <Toggle
              label={t('header.organization.menus.manageSSO.cdf_azure.title', 'Azure AD (CDF Aware)')}
              onChange={changeStatus}
              checked={enabled}
              dataCy="cdf-azure"
            />
          </div>
          <div className="card-title">
            <span className={` tj-text-xsm ${enabled ? 'enabled-tag' : 'disabled-tag'}`} data-cy="status-label">
              {enabled ? t('globals.enabled', 'Enabled') : t('globals.disabled', 'Disabled')}
            </span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <form noValidate className="sso-form-wrap">
          <div className="form-group mb-3">
            <label className="form-label" data-cy="client-id-label">
              {t('header.organization.menus.manageSSO.cdf_azure.clientId', 'Client Id')}
            </label>
            <div className="tj-app-input">
              <input
                type="text"
                className="form-control"
                placeholder={t('header.organization.menus.manageSSO.cdf_azure.enterClientId', 'Enter Client Id')}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                data-cy="client-id-input"
              />
            </div>
          </div>
          <div className="form-group mb-3">
            <label className="form-label" data-cy="client-secret-label">
              {t('header.organization.menus.manageSSO.cdf_azure.clientSecret', 'Client Secret')}
            </label>
            <div className="tj-app-input">
              <input
                type="text"
                className="form-control"
                placeholder={t(
                  'header.organization.menus.manageSSO.cdf_azure.enterClientSecret',
                  'Enter Client Secret'
                )}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                data-cy="client-secret-input"
              />
            </div>
          </div>
          <div className="form-group mb-3">
            <label className="form-label" data-cy="tenant-id-label">
              {t('header.organization.menus.manageSSO.cdf_azure.tenantId', 'Tenant Id')}
            </label>
            <div className="tj-app-input">
              <input
                type="text"
                className="form-control"
                placeholder={t('header.organization.menus.manageSSO.cdf_azure.enterTenantId', 'Enter Tenant Id')}
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                data-cy="tenant-id-input"
              />
            </div>
          </div>
          <div className="form-group mb-3">
            <label className="form-label" data-cy="cdf-base-url-label">
              {t('header.organization.menus.manageSSO.cdf_azure.cdfBaseUrl', 'CDF Base url')}
            </label>
            <div className="tj-app-input">
              <input
                type="text"
                className="form-control"
                placeholder={t('header.organization.menus.manageSSO.cdf_azure.enterCdfBaseUrl', 'Enter Base url')}
                value={cdfBaseUrl}
                onChange={(e) => setCdfBaseUrl(e.target.value)}
                data-cy="cdf-base-url-input"
              />
            </div>
          </div>
          {configId && (
            <div className="form-group mb-3">
              <label className="form-label" data-cy="redirect-url-label">
                {t('header.organization.menus.manageSSO.cdf_azure.redirectUrl', 'Redirect URL')}
              </label>
              <div className="d-flex justify-content-between form-control align-items-center">
                <p
                  data-cy="redirect-url"
                  id="redirect-url"
                >{`${window.public_config?.TOOLJET_HOST}/sso/cdf_azure/${configId}`}</p>
                <SolidIcon name="copy" width="16" onClick={() => copyFunction('redirect-url')} />
              </div>
            </div>
          )}
        </form>
      </div>
      <div className="form-footer sso-card-footer">
        <ButtonSolid onClick={reset} data-cy="cancel-button" variant="tertiary" className="sso-footer-cancel-btn">
          {t('globals.cancel', 'Cancel')}
        </ButtonSolid>

        <ButtonSolid
          disabled={isSaving}
          isLoading={isSaving}
          onClick={saveSettings}
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
    </div>
  );
}
