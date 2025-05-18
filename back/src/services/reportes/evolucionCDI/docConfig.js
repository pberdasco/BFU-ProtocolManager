export const headerText = 'Proyecto {SubP} / BfU de Argentina S.A.                     Anexo 4a';

export const sections = [
    {
        order: 1,
        title: 'Variación temporal de nivel freatimétrico y espesores de FLNA',
        paragraph: 'A continuación, se presentan los espesores de FLNA y los niveles freatimétricos registrados en las campañas de muestreo ' +
                    'realizadas en el sitio entre los meses de {RF}. Se realizaron gráficos para cada pozo de monitoreo donde fueron registrados espesores de FLNA.',
        graphCaption: 'Gráfico {sn}{gl}: Variación temporal del nivel freatimétrico y de los espesores de FLNA en el pozo {POZO}.'
    },
    {
        order: 2,
        title: 'Variación temporal de nivel freatimétrico y concentraciones de CDI',
        paragraph: 'En los siguientes gráficos se presentan las concentraciones de los CDI y los niveles freatimétricos registrados en las campañas de muestreos ' +
                    'realizadas entre los meses de enero de {RF}. En dichos gráficos se muestra la variación de los niveles freatimétricos y las concentraciones ' +
                    'de {CPS} en función del tiempo. Se realizaron gráficos para cada pozo de monitoreo donde fueron registrados dichos CDI.',
        graphCaption: 'Gráfico {sn}{gl}: {CP} en el pozo {POZO}.'
    }

];

// PlaceHolders:
// {SubP} proyectoNombre (viene en parametro proyectoNombre)
// sn: section number (cuenta solo las secciones que se muestran)
// gl: graph letter: a, b, c, etc aumentando por cada grafico. Inicia en a en cada seccion
// RF: rango de fechas en formato Enero 2012 a Diciembre 2023 (fechaDesde y fechaHasta podemos asumir que llegan en un parametro rangoFechas: {desde, hasta})
// POZO: nombre del pozo que se esta tratando (viene en el parametro chars)
// CPS: lista concatenada de los CP (compuestos) que se van a incluir en la seccion
// CP: compuesto en cuestion (viene en el parametro chars)
