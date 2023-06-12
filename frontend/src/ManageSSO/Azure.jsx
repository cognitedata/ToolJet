import React, { useState } from 'react';
import { organizationService } from '@/_services';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/_helpers/appUtils';
import { useTranslation } from 'react-i18next';
import SolidIcon from '@/_ui/Icon/SolidIcons';
import { ButtonSolid } from '@/_ui/AppButton/AppButton';
import Toggle from '@/_ui/Toggle/index';

export function Azure({ settings, updateData }) {
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [clientId, setClientId] = useState(settings?.configs?.clientId || '');
  const [tenantId, setTenantId] = useState(settings?.configs?.tenantId || '');
  const [isSaving, setSaving] = useState(false);
  const [configId, setConfigId] = useState(settings?.id);
  const { t } = useTranslation();

  const reset = () => {
    setClientId(settings?.configs?.clientId || '');
    setTenantId(settings?.configs?.tenantId || '');
  };

  const copyFunction = (input) => {
    let text = document.getElementById(input).innerHTML;
    copyToClipboard(text);
  };

  const saveSettings = () => {
    setSaving(true);
    organizationService.editOrganizationConfigs({ type: 'azure', configs: { clientId, tenantId } }).then(
      (data) => {
        setSaving(false);
        data.id && setConfigId(data.id);
        updateData('azure', {
          id: data.id,
          configs: { clientId: clientId, tenantId: tenantId },
        });
        toast.success('updated SSO configurations', {
          position: 'top-center',
        });
      },
      () => {
        setSaving(false);
        toast.error('Error while saving SSO configurations', {
          position: 'top-center',
        });
      }
    );
  };

  const changeStatus = () => {
    setSaving(true);
    organizationService.editOrganizationConfigs({ type: 'azure', enabled: !enabled }).then(
      (data) => {
        setSaving(false);
        const enabled_tmp = !enabled;
        setEnabled(enabled_tmp);
        data.id && setConfigId(data.id);
        updateData('azure', { id: data.id, enabled: enabled_tmp });
        toast.success(`${enabled_tmp ? 'Enabled' : 'Disabled'} Azure SSO`, {
          position: 'top-center',
        });
      },
      () => {
        setSaving(false);
        toast.error('Error while saving SSO configurations', {
          position: 'top-center',
        });
      }
    );
  };

  return (
    <div className="sso-card-wrapper">
      <div className="card-header">
        <div className="d-flex justify-content-between title-with-toggle">
          <div>
            <Toggle
              label={t('header.organization.menus.manageSSO.azure.title', 'Azure AD')}
              onChange={changeStatus}
              checked={enabled}
              dataCy="azure"
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
              {t('header.organization.menus.manageSSO.azure.clientId', ' Client Id')}
            </label>
            <div className="tj-app-input">
              <input
                type="text"
                className="form-control"
                placeholder={t('header.organization.menus.manageSSO.azure.enterClientId', 'Enter Client Id')}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                data-cy="client-id-input"
              />
            </div>
          </div>
          <div className="form-group mb-3">
            <label className="form-label" data-cy="tenant-id-label">
              {t('header.organization.menus.manageSSO.azure.tenantId', 'Tenant Id')}
            </label>
            <div className="tj-app-input">
              <input
                type="text"
                className="form-control"
                placeholder={t('header.organization.menus.manageSSO.azure.enterTenantId', 'Enter Tenant Id')}
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                data-cy="tenant-id-input"
              />
            </div>
          </div>
          {configId && (
            <div className="form-group mb-3">
              <label className="form-label" data-cy="redirect-url-label">
                {t('header.organization.menus.manageSSO.azure.redirectUrl', 'Redirect URL')}
              </label>
              <div className="d-flex justify-content-between form-control align-items-center">
                <p
                  data-cy="redirect-url"
                  id="redirect-url"
                >{`${window.public_config?.TOOLJET_HOST}/sso/azure/${configId}`}</p>
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
