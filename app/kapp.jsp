<%@taglib prefix="c"   uri="http://java.sun.com/jstl/core"  %>
<%@taglib prefix="app" uri="http://kineticdata.com/taglibs/core/app" %>
<!DOCTYPE html>
<html ng-app="kd.bundle.angular">
  <head>
    <title>Request CE</title>

    <!-- Specify content width scale for mobile devices and let the magic begin -->
    <meta content='width=device-width, initial-scale=1.0' name='viewport'>

    <!-- inject:vendor:css -->
    <!-- endinject -->

    <!-- inject:css -->
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
    <!-- endinject -->

    <!-- inject:js -->
    <!-- endinject -->

    <script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
  </body>
</html>
