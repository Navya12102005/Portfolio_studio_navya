import unittest

from esim_tm import doctor, registry


class TestRegistry(unittest.TestCase):
    def test_parse(self):
        self.assertGreater(registry.parse("9.0.1"), registry.parse("6.0"))

    def test_python_detected(self):
        s = registry.check("python3", registry.load()["python3"])
        self.assertTrue(s.installed and s.ok)

    def test_missing_tool(self):
        spec = {"version_cmd": ["no-such-tool-xyz"], "version_regex": "(x)",
                "min_version": "1"}
        self.assertFalse(registry.check("fake", spec).installed)


class TestDoctor(unittest.TestCase):
    def test_apt(self):
        tips = doctor.diagnose("E: Unable to locate package ngspice")
        self.assertIn("ngspice", tips[0])

    def test_pip(self):
        self.assertTrue(doctor.diagnose("error: externally-managed-environment"))


if __name__ == "__main__":
    unittest.main()
