<%@taglib prefix="c"   uri="http://java.sun.com/jstl/core"  %>
<%@taglib prefix="app" uri="http://kineticdata.com/taglibs/core/app" %>
<!DOCTYPE html>
<html ng-app="kd.bundle.angular">
  <head>
    <title>Request CE</title>

    <!-- Specify content width scale for mobile devices and let the magic begin -->
    <meta content='width=device-width, initial-scale=1.0' name='viewport'>

    <!-- inject:vendor:css -->
    <link rel="stylesheet" href="${bundle.location}/dist/vendors/vendors.css">
    <!-- endinject -->

    <!-- inject:css -->
    <link rel="stylesheet" href="${bundle.location}/dist/css/assets/bundle.css">
    <link rel="stylesheet" href="${bundle.location}/dist/css/assets/styles.css">
    <!-- endinject -->

    <app:headContent/>
  </head>
  <body>
    <div data-comment="top level view" data-ui-view=""></div>

    <script>
      window.KD = window.KD || {};
      window.KD.context = '${pageContext.request.contextPath}';
      window.KD.space = '${space.slug}';
      window.KD.kappSlug = '${kapp.slug}';
      window.KD.kappName = '${kapp.name}';
      window.KD.base = KD.context + '/' + KD.space;

      window.KD.formsBase = window.KD.base + '/' + window.KD.kappSlug;
      window.KD.api = window.KD.base + '/app/api/v1';
      window.KD.bundleLocation = '${bundle.location}';
    </script>

    <!-- inject:vendor:js -->
    <script src="${bundle.location}/dist/vendors/vendors.js"></script>
    <!-- endinject -->

    <!-- inject:js -->
    <script src="${bundle.location}/dist/app/queue/setup/queue.setup.module.js"></script>
    <script src="${bundle.location}/dist/app/queue/setup/queue.setup.routes.js"></script>
    <script src="${bundle.location}/dist/app/queue/setup/queue.setup.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/setup/filter.qualification.controller.js"></script>
    <script src="${bundle.location}/dist/app/core/core.module.js"></script>
    <script src="${bundle.location}/dist/app/core/toast/toast.service.js"></script>
    <script src="${bundle.location}/dist/app/core/models/models.module.js"></script>
    <script src="${bundle.location}/dist/app/core/models/submission.model.js"></script>
    <script src="${bundle.location}/dist/app/core/models/space.model.js"></script>
    <script src="${bundle.location}/dist/app/core/models/kapp.model.js"></script>
    <script src="${bundle.location}/dist/app/core/models/form.types.model.js"></script>
    <script src="${bundle.location}/dist/app/core/models/form.model.js"></script>
    <script src="${bundle.location}/dist/app/core/models/attribute.definition.model.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/authentication.module.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/login.modal.service.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/login.modal.controller.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/login.controller.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/authentication.service.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/authentication.run.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/authentication.routes.js"></script>
    <script src="${bundle.location}/dist/app/core/authentication/authentication.config.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.module.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.work.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.summary.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.routes.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.new.item.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.list.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.detail.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/queue.assignment.controller.js"></script>
    <script src="${bundle.location}/dist/app/queue/items.service.js"></script>
    <script src="${bundle.location}/dist/app/queue/assignment.service.js"></script>
    <script src="${bundle.location}/dist/app/layout/layout.module.js"></script>
    <script src="${bundle.location}/dist/app/layout/layout.routes.js"></script>
    <script src="${bundle.location}/dist/app/layout/layout.public.controller.js"></script>
    <script src="${bundle.location}/dist/app/layout/layout.controller.js"></script>
    <script src="${bundle.location}/dist/app/errors/errors.module.js"></script>
    <script src="${bundle.location}/dist/app/errors/errors.routes.js"></script>
    <script src="${bundle.location}/dist/app/common/common.module.js"></script>
    <script src="${bundle.location}/dist/app/core/time.ago.js"></script>
    <script src="${bundle.location}/dist/app/core/slugifier.js"></script>
    <script src="${bundle.location}/dist/app/core/core.api.js"></script>
    <script src="${bundle.location}/dist/app/core/config.store.js"></script>
    <script src="${bundle.location}/dist/app/core/bundle.utils.js"></script>
    <script src="${bundle.location}/dist/app/catalog/catalog.module.js"></script>
    <script src="${bundle.location}/dist/app/catalog/form.controller.js"></script>
    <script src="${bundle.location}/dist/app/catalog/catalog.routes.js"></script>
    <script src="${bundle.location}/dist/app/catalog/catalog.controller.js"></script>
    <script src="${bundle.location}/dist/app/app.js"></script>
    <script src="${bundle.location}/dist/app/bundle-templates.js"></script>
    <script src="${bundle.location}/dist/app/app.routes.js"></script>
    <script src="${bundle.location}/dist/app/app.constants.js"></script>
    <script src="${bundle.location}/dist/app/app.config.js"></script>
    <!-- endinject -->

    <script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
  </body>
</html>
