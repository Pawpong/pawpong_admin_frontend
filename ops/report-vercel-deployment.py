import os
import urllib.parse
import urllib.request
from notify import send, deployment_payload, enrich_deployment

def report(env):
    env = enrich_deployment(env)
    env['APP_ENV'] = 'production' if env.get('DEPLOY_ENVIRONMENT', '').lower() == 'production' else 'preview'
    if env['APP_ENV'] == 'production':
        env['DEPLOY_SERVICE_URL'] = 'https://admin.pawpong.kr' if env.get('DEPLOY_SERVICE') == 'admin' else 'https://pawpong.kr'
    elif env.get('DEPLOY_SERVICE') == 'web' and env.get('DEPLOY_BRANCH') == 'dev':
        env['DEPLOY_SERVICE_URL'] = 'https://dev.pawpong.kr'
    env['DEPLOY_HEALTH'] = 'not verified; deployment failed'
    if env['DEPLOY_STATUS'] == 'success':
        url = env.get('DEPLOY_URL', '')
        parsed = urllib.parse.urlparse(url)
        allowed = parsed.scheme == 'https' and (parsed.hostname in ('pawpong.kr', 'www.pawpong.kr', 'admin.pawpong.kr', 'dev.pawpong.kr') or (parsed.hostname or '').endswith('.vercel.app'))
        env['DEPLOY_HEALTH'] = 'not verified; deployment URL unavailable'
        if allowed:
            try:
                with urllib.request.urlopen(url, timeout=10) as response: env['DEPLOY_HEALTH'] = 'HTTP ' + str(response.status)
            except Exception: env['DEPLOY_HEALTH'] = 'public health check failed or access-protected'
    webhook = env.get('DISCORD_DEPLOY_WEBHOOK_URL') if env['APP_ENV'] == 'production' else env.get('DISCORD_DEV_DEPLOY_WEBHOOK_URL')
    send(webhook, deployment_payload(env))

if __name__ == '__main__':
    try: report(os.environ)
    except Exception: raise SystemExit('deployment_notification_failed') from None
