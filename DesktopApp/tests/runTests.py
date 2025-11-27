import unittest, sys
from PyQt6 import QtWidgets

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    testSuite = unittest.TestLoader().discover('DesktopApp/tests', pattern='test_*.py')
    unittest.TextTestRunner().run(testSuite)