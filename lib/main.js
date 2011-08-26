// Required modules
var tabs = require("tabs");
var widget = require("widget");

var widgetContent = 'data:image/png;base64,' +
'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAYNpQ0NQSUND' +
'IFByb2ZpbGUAAHiclZHPKwRhGMc/70hK7MX4kVJzEHtY2riskrJ7QBzWpuzubXZmrK0x+zbzWvwB7spN' +
'Dn6Uk+Qkx/0D3JQcpJQ/QCkXaRxe2gvJt576PN+een6B0bSl9A1gI1BhYS5rFUtlq+Meg24AsJ1Izubz' +
'S/yqtzsEwO2YLaX/e92P6gqLpTIIEzCrmpOAWdE8DZhbSioQecB01m0XhAukwpVCDsQekKhqPgISFc2X' +
'QKLhVBWIJpAO3FoA4gXIuF7kgJEElCNDBcYhMFwslS09mlqEmSFou2l55QjOz6B/pOUlB6B3Fa4nW97r' +
'MgIQfTfR2uQEAKIrC+2Pcfw6Ah378LEXx+8ncfxxCm0P0AyczbDxdRdhTMFfud5N5/oHoPv+zHp/ANJw' +
'PA+rnbC4CwdPMHoBPVeQ74aVKYzM83foWwEwmLP9WiW0ledahbmslav79TCStuP96+1/S3nbCiBXlzth' +
'rbqurFkpfS9lLQTOeMqaSKczfALti23iIBRc0gAAAAlwSFlzAAALEwAACxMBAJqcGAAAAu1JREFUOI19' +
'UmtIk2EYPd+3Tadus3mhi6zhrKyILtvEOa9ZkWVRFiViP0qiC1F0swzqX1H0I8gSioroClFZP4QoWFGZ' +
'aMokU2tuMy3tOm3OXb/v/d63X8qM7Pw7PM858JznAP9B4RMrK2zIXQoABfWWDXkPssJ/7/DRpNhmzYjm' +
'TKSgEfHg7nOlBiJKyTRCxf8aUAGuooacw2NcEqhACXKJVziZ6lZcQAiq8gO5Zyc1kATqI4SeAoD8+xYf' +
'IyyGEqrtzPhdsSjPEntm5XGkp82qXrPdWD2m4Sbc/DB7qUTZc07ifRq5WlM1twIJshh0e/pxve0WjHMz' +
'Uaotwek3dWCEgRIGruCRxUfAL2kqa3IDgPWOmSmgwO555XD96kAoEoQIJZoHP+K3bwRZaQvR/6DdbXvc' +
'MwsA5JSyOE4iLuvdrNtyiS+ZppyOdfp8fPxmx2h4BD+DoyCxidhjroLH78flxitQKWnneAaNG1sUUoS2' +
'UJFuEUSSstmwHI7v7fCFvPjp90GQqVA41Yy3bhvkLAwmcvCmcyvmV8/eOyGD7KumiEGtjzElp2FguA+e' +
'QABhWTyKddno+dqBoTYvkv3x6EslGKRf4AsHAALIxxMMMylROwUKPh5DwRBCiENO0gJ09XbDea0b+fZe' +
'WJUCnvBauGfq+lXtrtneXYaj42+UEb727adWjISAEI1DTspC9A514WW9E2q7EztIBD2gMIthWvPps36P' +
'OuHVWtOxhnGDpv1tNZzAv77x4h5WGVYiSEYhScAUmQZVmhi4JIoyL8CN+nk7I2QbZRbdkZpGWXQPvtl+' +
'XNcVzVjW4mrVT1XroJRp0Wp3IOGDB0skwj5zHCcCcCRo+GbTYgzIBTKhSGOYf2jOTUkglRJhvKIvGcZe' +
'L+ocLuk7B26nPi2wfnHBxffOd9zw/oqn/9JPgHlflr1yUylzAux2UhzLK1l2Pnoun0w4hrbaVuPw1kzx' +
'xOpMEng2eCl2Wno9AGwtKlIGUlPFPw1IUZZmex5NAAAAAElFTkSuQmCC';

// Set up the widgets
var bugwidget = widget.Widget({
    id: "jpbugwidget",
    label: "Bug date organizer",
    content: "<img src='"+ widgetContent + "'/>",
    onClick: function() {
      tabs.open("http://kwierso.github.com/Jetpack-Bugzilla-Organizer/");
    }
});

//panel.show();




