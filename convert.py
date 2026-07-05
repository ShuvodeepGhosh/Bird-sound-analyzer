import base64
with open('frontend/public/logo.png', 'rb') as f:
    img = base64.b64encode(f.read()).decode('utf-8')
with open('frontend/public/logo.svg', 'w') as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><image href="data:image/png;base64,' + img + '" width="100%" height="100%"/></svg>')
